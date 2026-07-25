// @ts-nocheck
"use client";
// app/lib/useOrders.tsx
//
// Data hooks for the customer dashboard.
//
// Note on security: these queries never filter by customer_id in JavaScript.
// They don't need to — the RLS policies in the database do it, and doing it
// there means a mistake here cannot leak another customer's data.

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

/** All orders for the signed-in customer, newest first */
export function useMyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        // admin_notes is deliberately excluded — it must never reach the client
        "id, public_ref, items, status, purchase_date, created_at, " +
        "item_price_jpy, service_fee_jpy, shipping_cost_jpy, shipping_paid, " +
        "shipping_method, tracking_number, delivery_country, notes, " +
        "event_name, event_date, event_status, event_result, shipment_id"
      )
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    setOrders(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Live updates: when the admin creates or changes an order, the customer's
  // dashboard reflects it without a refresh. Without this, someone sitting on
  // the page would see nothing until they reloaded.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  return { orders, loading, error, reload: load };
}

/**
 * Packages that bundle several of the customer's orders together — one
 * tracking number, one shipping payment. RLS only returns shipments that
 * hold at least one of this customer's orders.
 */
export function useMyShipments() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setShipments([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("shipments")
      .select("id, tracking_number, shipping_method, shipping_cost_jpy, shipping_paid, status, notes, created_at")
      .order("created_at", { ascending: false });
    setShipments(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-shipments")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  return { shipments, loading, reload: load };
}

/** One package: its own record, the orders bundled into it, and its pending payment */
export function useShipmentDetail(shipmentId) {
  const [shipment, setShipment] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!shipmentId) return;
    setLoading(true);

    const [s, o, pay] = await Promise.all([
      supabase.from("shipments").select("*").eq("id", shipmentId).single(),
      supabase
        .from("orders")
        .select("id, public_ref, items, status, item_price_jpy, service_fee_jpy, delivery_country")
        .eq("shipment_id", shipmentId)
        .order("created_at", { ascending: true }),
      supabase
        .from("payments")
        .select("*")
        .eq("shipment_id", shipmentId)
        .eq("status", "pending")
        .maybeSingle(),
    ]);

    setShipment(s.data);
    setOrders(o.data || []);
    setPayment(pay.data);
    setLoading(false);
  }, [shipmentId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!shipmentId) return;
    const channel = supabase
      .channel(`shipment-${shipmentId}`)
      .on("postgres_changes",
          { event: "*", schema: "public", table: "shipments", filter: `id=eq.${shipmentId}` },
          () => load())
      .on("postgres_changes",
          { event: "*", schema: "public", table: "orders", filter: `shipment_id=eq.${shipmentId}` },
          () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [shipmentId, load]);

  return { shipment, orders, payment, loading, reload: load };
}

/** One order, with its photos, timeline and pending payment */
export function useOrderDetail(orderId) {
  const [order, setOrder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [events, setEvents] = useState([]);
  const [payment, setPayment] = useState(null);
  // Set only when this order ships as part of a bundled package
  const [shipment, setShipment] = useState(null);
  const [shipmentOrders, setShipmentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);

    const [o, p, e] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, public_ref, items, status, purchase_date, created_at, " +
          "item_price_jpy, service_fee_jpy, shipping_cost_jpy, shipping_paid, " +
          "shipping_method, tracking_number, delivery_country, notes, " +
          "event_name, event_date, event_status, event_result, shipment_id"
        )
        .eq("id", orderId)
        .single(),
      supabase
        .from("order_photos")
        .select("*")
        .eq("order_id", orderId)
        .order("sort_order"),
      supabase
        .from("order_events")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true }),
    ]);

    setOrder(o.data);
    setPhotos(p.data || []);
    setEvents(e.data || []);

    if (o.data?.shipment_id) {
      // Shipping lives on the package, not this individual order
      const [ship, siblings, pay] = await Promise.all([
        supabase.from("shipments").select("*").eq("id", o.data.shipment_id).single(),
        supabase
          .from("orders")
          .select("id, public_ref, items")
          .eq("shipment_id", o.data.shipment_id),
        supabase
          .from("payments")
          .select("*")
          .eq("shipment_id", o.data.shipment_id)
          .eq("status", "pending")
          .maybeSingle(),
      ]);
      setShipment(ship.data);
      setShipmentOrders(siblings.data || []);
      setPayment(pay.data);
    } else {
      setShipment(null);
      setShipmentOrders([]);
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", orderId)
        .eq("status", "pending")
        .maybeSingle();
      setPayment(data);
    }

    setLoading(false);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  // Live updates on this order: status changes, new photos, payment requests
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes",
          { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
          () => load())
      .on("postgres_changes",
          { event: "*", schema: "public", table: "order_photos", filter: `order_id=eq.${orderId}` },
          () => load())
      .on("postgres_changes",
          { event: "*", schema: "public", table: "order_events", filter: `order_id=eq.${orderId}` },
          () => load())
      .on("postgres_changes",
          { event: "*", schema: "public", table: "shipments" },
          () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId, load]);

  return { order, photos, events, payment, shipment, shipmentOrders, loading, reload: load };
}

/** Unread notifications, with a live subscription */
export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setItems(data || []);
    setUnread((data || []).filter(n => !n.read).length);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Live updates — the bell increments without a refresh
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  async function markAllRead() {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    load();
  }

  return { items, unread, markAllRead, reload: load };
}

/**
 * Totals across all orders — powers the dashboard summary. Shipping due is
 * tracked on the order for standalone items, but on the shipment for
 * anything bundled into a package — an order in a package never counts its
 * own shipping_cost_jpy, or a shared shipping cost would be added once per
 * item instead of once per package.
 */
export function useAccountSummary(orders, shipments = []) {
  const active = orders.filter(
    o => !["Delivered", "Cancelled"].includes(o.status)
  );

  const orderOutstanding = orders
    .filter(o => !o.shipment_id && !o.shipping_paid && (o.shipping_cost_jpy || 0) > 0)
    .reduce((sum, o) => sum + (o.shipping_cost_jpy || 0), 0);

  const shipmentsNeedingPayment = shipments.filter(
    s => !s.shipping_paid && (s.shipping_cost_jpy || 0) > 0
  );
  const shipmentOutstanding = shipmentsNeedingPayment
    .reduce((sum, s) => sum + (s.shipping_cost_jpy || 0), 0);

  const needsAction = orders.filter(
    o => (!o.shipment_id && o.status === "Awaiting Shipping Payment") || o.status === "Action Required"
  );

  return {
    activeCount: active.length,
    totalCount: orders.length,
    outstanding: orderOutstanding + shipmentOutstanding,
    needsAction,
    shipmentsNeedingPayment,
  };
}


/** The customer's own requests, so they can see what they sent */
export function useMyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setRequests([]); setLoading(false); return; }
    const { data } = await supabase
      .from("requests")
      .select("id, items, status, country, budget, created_at, order_id")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-requests")
      .on("postgres_changes",
          { event: "*", schema: "public", table: "requests" },
          () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  return { requests, loading, reload: load };
}
