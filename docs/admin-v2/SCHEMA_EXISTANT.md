# Schéma existant de la production (documentation)

> Généré le 2026-10-13 en **lecture seule** depuis la spécification OpenAPI de PostgREST (Supabase), puis relu.
> Ce document décrit ce qui existe **avant** l'admin-v2. Aucune de ces tables n'est modifiée par les migrations de la phase 0.
>
> **Ce que cette méthode ne donne pas** : les politiques RLS, les triggers, les index et les contraintes. Pour les obtenir, exécuter une fois les requêtes de la section « Compléments à exporter » dans le SQL Editor de Supabase (lecture seule) et coller le résultat dans `docs/admin-v2/RLS_EXPORT.md`.

Nombre de lignes au 2026-10-13 : voir chaque table.

## `admin_events` — 9 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `title` | text | oui |  |
| `date` | date | oui |  |
| `time` | text |  |  |
| `location` | text |  |  |
| `description` | text |  |  |
| `category` | text |  | `other` |
| `status` | text |  | `upcoming` |
| `url` | text |  |  |
| `capacity` | text |  |  |
| `created_at` | timestamp with time zone |  | `now()` |
| `updated_at` | timestamp with time zone |  | `now()` |

## `announce` — 1 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `text_en` | text |  |  |
| `text_fr` | text |  |  |
| `text_ja` | text |  |  |
| `text_es` | text |  |  |
| `text_it` | text |  |  |
| `text_de` | text |  |  |
| `text_ko` | text |  |  |
| `text_zh` | text |  |  |
| `from_date` | text |  |  |
| `to_date` | text |  |  |
| `active` | boolean |  | `true` |
| `updated_at` | timestamp without time zone |  | `now()` |

## `box_waitlist` — 2 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `email` | text | oui |  |
| `created_at` | timestamp with time zone | oui | `now()` |

## `business_charges` — 8 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `label` | text | oui |  |
| `type` | text | oui |  |
| `rate` | numeric |  |  |
| `fixed_amount_jpy` | numeric |  |  |
| `notes` | text |  |  |
| `sort_order` | integer |  | `0` |
| `created_at` | timestamp with time zone |  | `now()` |

## `business_expenses` — 0 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `label` | text | oui |  |
| `category` | text |  |  |
| `amount_jpy` | numeric | oui | `0` |
| `frequency` | text | oui | `monthly` |
| `notes` | text |  |  |
| `sort_order` | integer |  | `0` |
| `created_at` | timestamp with time zone |  | `now()` |

## `business_savings` — 0 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `reserved_jpy` | numeric |  | `0` |
| `updated_at` | timestamp with time zone |  | `now()` |

## `business_tax_settings` — 1 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `prev_year_income_override` | numeric |  |  |
| `kokuho_rate_pct` | numeric | oui | `10.58` |
| `kokuho_flat_jpy` | numeric | oui | `67073` |
| `kokuho_deduction_jpy` | numeric | oui | `430000` |
| `kokuho_proration_months` | integer | oui | `12` |
| `nenkin_monthly_jpy` | numeric | oui | `17920` |
| `income_tax_base_deduction_jpy` | numeric | oui | `480000` |
| `income_tax_blue_return_deduction_jpy` | numeric | oui | `0` |
| `income_tax_other_deductions_jpy` | numeric | oui | `0` |
| `reconstruction_surtax_pct` | numeric | oui | `2.1` |
| `juminzei_deduction_jpy` | numeric | oui | `430000` |
| `juminzei_proportional_pct` | numeric | oui | `10` |
| `juminzei_flat_jpy` | numeric | oui | `5000` |
| `jigyozei_threshold_jpy` | numeric | oui | `2900000` |
| `jigyozei_rate_pct` | numeric | oui | `5` |
| `consumption_tax_subject` | boolean | oui | `false` |
| `consumption_tax_invoice_registered` | boolean | oui | `false` |
| `consumption_tax_manual_amount_jpy` | numeric | oui | `0` |
| `safety_reserve_pct` | numeric | oui | `25` |
| `updated_at` | timestamp with time zone |  | `now()` |

## `events` — 34 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `title` | text | oui |  |
| `date` | date | oui |  |
| `type` | text | oui |  |
| `description` | text |  |  |
| `store` | text |  |  |
| `created_at` | timestamp without time zone |  | `now()` |

## `gallery` — 12 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `title` | text | oui |  |
| `subtitle` | text |  |  |
| `image_url` | text | oui |  |
| `sort_order` | integer |  | `0` |
| `created_at` | timestamp without time zone |  | `now()` |

## `news` — 9 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `title` | text | oui |  |
| `content` | text | oui |  |
| `category` | text | oui |  |
| `published_at` | timestamp without time zone |  | `now()` |
| `created_at` | timestamp without time zone |  | `now()` |

## `notifications` — 38 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `user_id` | uuid | oui |  |
| `order_id` | bigint |  |  |
| `type` | text | oui |  |
| `title` | text | oui |  |
| `body` | text |  |  |
| `read` | boolean |  | `false` |
| `email_sent` | boolean |  | `false` |
| `created_at` | timestamp with time zone |  | `now()` |

## `order_events` — 323 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `order_id` | bigint | oui |  |
| `status` | text | oui |  |
| `note` | text |  |  |
| `created_at` | timestamp with time zone |  | `now()` |

## `order_photos` — 1 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `order_id` | bigint | oui |  |
| `url` | text | oui |  |
| `caption` | text |  |  |
| `sort_order` | integer |  | `0` |
| `created_at` | timestamp with time zone |  | `now()` |

## `orders` — 175 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `client_name` | text | oui |  |
| `platform` | text |  |  |
| `communication` | text |  |  |
| `items` | text |  |  |
| `item_price_jpy` | integer |  | `0` |
| `service_fee_jpy` | integer |  | `0` |
| `payment_method` | text |  |  |
| `payment_received` | boolean |  | `true` |
| `status` | text |  | `Pending` |
| `purchase_date` | date |  |  |
| `shipping_method` | text |  |  |
| `tracking_number` | text |  |  |
| `delivery_country` | text |  |  |
| `notes` | text |  |  |
| `created_at` | timestamp with time zone |  | `now()` |
| `updated_at` | timestamp with time zone |  | `now()` |
| `client_email` | text |  |  |
| `public_ref` | text |  |  |
| `customer_id` | uuid |  |  |
| `shipping_cost_jpy` | integer |  | `0` |
| `shipping_paid` | boolean |  | `false` |
| `admin_notes` | text |  |  |
| `event_name` | text |  |  |
| `event_date` | date |  |  |
| `event_status` | text |  |  |
| `event_result` | text |  |  |
| `shipment_id` | bigint |  |  |
| `client_phone` | text |  |  |
| `shipping_address` | text |  |  |

## `payment_links` — 214 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `label` | text | oui |  |
| `amount_jpy` | numeric | oui |  |
| `client_name` | text |  |  |
| `client_email` | text |  |  |
| `status` | text | oui | `pending` |
| `paypal_order_id` | text |  |  |
| `paid_at` | timestamp with time zone |  |  |
| `created_at` | timestamp with time zone |  | `now()` |
| `item_amount_jpy` | numeric |  |  |
| `fee_amount_jpy` | numeric |  |  |
| `client_phone` | text |  |  |
| `paypal_fee_jpy` | integer | oui | `0` |
| `shipping_address` | text |  |  |
| `items_breakdown` | jsonb |  |  |
| `is_shipping` | boolean |  | `false` |
| `paypal_real_fee_jpy` | numeric |  |  |

## `payments` — 0 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `order_id` | bigint |  |  |
| `amount_jpy` | integer | oui |  |
| `kind` | text | oui | `shipping` |
| `status` | text | oui | `pending` |
| `paypal_order_id` | text |  |  |
| `paid_at` | timestamp with time zone |  |  |
| `created_at` | timestamp with time zone |  | `now()` |
| `shipment_id` | bigint |  |  |

## `profiles` — 90 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui |  |
| `full_name` | text |  |  |
| `country` | text |  |  |
| `created_at` | timestamp with time zone |  | `now()` |
| `updated_at` | timestamp with time zone |  | `now()` |

## `requests` — 107 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `customer_id` | uuid |  |  |
| `name` | text | oui |  |
| `email` | text | oui |  |
| `country` | text |  |  |
| `items` | text | oui |  |
| `budget` | text |  |  |
| `notes` | text |  |  |
| `status` | text | oui | `new` |
| `order_id` | bigint |  |  |
| `created_at` | timestamp with time zone |  | `now()` |
| `updated_at` | timestamp with time zone |  | `now()` |
| `quantity` | text |  |  |
| `purchase_type` | text |  |  |
| `deadline` | date |  |  |
| `partial_ok` | boolean |  |  |
| `lead_type` | text |  | `consumer` |
| `business_name` | text |  |  |
| `business_website` | text |  |  |
| `business_type` | text |  |  |
| `product_category` | text |  |  |
| `recurring_sourcing` | text |  |  |
| `contact_platform` | text |  |  |
| `discovery_source` | text |  |  |
| `utm_source` | text |  |  |
| `utm_medium` | text |  |  |
| `utm_campaign` | text |  |  |
| `utm_content` | text |  |  |
| `utm_term` | text |  |  |

## `shipments` — 0 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `tracking_number` | text |  |  |
| `shipping_method` | text |  |  |
| `shipping_cost_jpy` | integer | oui | `0` |
| `shipping_paid` | boolean | oui | `false` |
| `status` | text | oui | `Awaiting Shipping Payment` |
| `notes` | text |  |  |
| `created_at` | timestamp with time zone | oui | `now()` |
| `paid_at` | timestamp with time zone |  |  |

## `shop_items` — 9 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | uuid | oui | `gen_random_uuid()` |
| `image_url` | text | oui |  |
| `price_jpy` | integer | oui |  |
| `available` | boolean | oui | `true` |
| `sort_order` | integer | oui | `0` |
| `created_at` | timestamp with time zone | oui | `now()` |
| `name` | text |  |  |
| `fee_jpy` | integer | oui | `6000` |
| `buyer_name` | text |  |  |
| `ship_by` | date |  |  |

## `translation_cache` — 0 ligne(s)

| Colonne | Type | Obligatoire | Défaut |
|---|---|---|---|
| `id` | bigint | oui |  |
| `cache_key` | text | oui |  |
| `lang` | text | oui |  |
| `translated` | jsonb | oui |  |
| `created_at` | timestamp with time zone |  | `now()` |
| `updated_at` | timestamp with time zone |  | `now()` |

## Compléments à exporter (SQL Editor, lecture seule)

```sql
-- 1. Politiques RLS
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' order by tablename, policyname;

-- 2. Tables avec / sans RLS activée
select c.relname as table, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;

-- 3. Triggers
select event_object_table as table, trigger_name, action_timing, event_manipulation, action_statement
from information_schema.triggers where trigger_schema = 'public' order by 1, 2;

-- 4. Fonctions
select p.proname, pg_get_function_identity_arguments(p.oid) as args, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' order by 1;

-- 5. Index et contraintes
select tablename, indexname, indexdef from pg_indexes where schemaname = 'public' order by 1, 2;
```
