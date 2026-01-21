# Offline vs Connected Strategy Recommendation

## Summary recommendation
For scaling to the broader offline market (e.g., Malika), a **hybrid online-first system with offline-capable point-of-sale (POS) mode** is the strongest long-term choice. This approach provides a full cloud back office while still allowing shops to sell and record transactions during outages or poor connectivity.

## Why hybrid is best for the offline market
- **Real-world connectivity is inconsistent** in many retail districts, so purely online systems risk downtime during sales peaks.
- **Cloud back office unlocks scale**: centralized reporting, multi-shop management, remote inventory visibility, and easier software updates.
- **Offline-first POS reduces sales disruption** and preserves trust: sales can continue even if the internet drops.
- **Sync enables data accuracy**: once back online, the system reconciles inventory, sales, and debt/settlements.

## When fully offline is acceptable
A fully offline app can work for a single shop with no need for remote access or multi-branch analytics. It becomes harder to scale and monetize because:
- Updates require manual distribution.
- Data is trapped on devices.
- Cross-shop insights and centralized support are limited.

## Practical architecture (recommended)
1. **Cloud core**
   - Central API and database (e.g., MongoDB Atlas).
   - Multi-tenant support for different shops.
   - Reporting, analytics, backups, and user management.

2. **Offline-capable client**
   - Local database (IndexedDB/SQLite) for POS operations.
   - Background sync queue with conflict resolution.
   - “Last write wins” or rules-based merge for stock and payments.

3. **Sync strategy**
   - Incremental sync with timestamps.
   - Strong ID strategy to avoid duplication.
   - Audit trail for reconciliation.

## Decision guide
- **If you want to scale to many shops:** choose **hybrid (cloud + offline-capable POS)**.
- **If you only need one shop and no remote insights:** a **fully offline app** can be cheaper to start.

## Next steps
- Confirm if you want offline POS now or a phased rollout.
- Decide on initial stack (web + local cache vs. desktop app).
- Define the minimum offline requirements (sales, stock, debt settlement).
