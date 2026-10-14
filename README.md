
# ASCOT Casiguran Feasibility Study

## Connect to local MySQL (XAMPP / WAMP)

The Node.js server connects directly to a local MySQL or MariaDB service; PHP is not required for the connection. The browser communicates only with the app server, so MySQL credentials stay server-side. When configured, MySQL is selected ahead of Supabase and local JSON storage.

1. Start MySQL from XAMPP or WAMP and open phpMyAdmin.
2. In phpMyAdmin, use **Import** to run [`data/mysql_schema.sql`](./data/mysql_schema.sql). It creates the `ascot_fss` database and the `ascot_surveys` table.
3. Add these settings to the project root `.env` file (adjust the host, port, and credentials to match your local MySQL account):

   ```dotenv
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_DATABASE=ascot_fss
   ```

4. Restart the app with `npm run dev`. The database view and header should report whether the MySQL connection is active.

Do not commit `.env` or expose MySQL credentials in frontend code. If MySQL is configured but unavailable, database operations return errors instead of silently switching to another storage provider.

## Connect the app to Supabase

The server uses Supabase for survey storage when valid credentials are present. Otherwise, it falls back to `data/surveys.json`.

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor**, paste the contents of [`data/supabase_schema.sql`](./data/supabase_schema.sql), and run it. This creates the `ascot_surveys` table used by the app.
3. In **Project Settings > API**, copy the Project URL and the publishable key.
4. Create `.env.local` in the project root and set:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   `.env.local` is ignored by Git. Although these names follow Supabase's Next.js convention, this Vite/Express app reads them only in its Node server; they are not exposed to browser code. The server also accepts `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_ANON_KEY`). Restart the server after changing the values. A service-role key is accepted as `SUPABASE_SERVICE_ROLE_KEY` for server-only use, but must never be exposed in browser code.

5. Start the app with `npm run dev`. Open the database view; its status should show that Supabase Cloud PostgreSQL is active.

For deployment, add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to the hosting provider's server environment variables, then redeploy. Local `.env` files are not uploaded automatically.

> **Before using real respondent data:** the example SQL grants the `anon` role broad read, insert, update, and delete access. Replace those policies with least-privilege policies and add server-side authorization before exposing the app publicly. Never put a service-role key in browser code.
