import { createBrowserClient } from '@supabase/ssr';

/**
 * Create Supabase client for Client Components
 *
 * This client is used in Client Components ('use client') that need
 * to interact with Supabase directly from the browser.
 *
 * @example
 * ```typescript
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 *
 * export default function ClientComponent() {
 *   const supabase = createClient();
 *
 *   const handleSubmit = async () => {
 *     const { data } = await supabase.from('posts').insert({ ... });
 *   };
 *
 *   return <button onClick={handleSubmit}>Submit</button>;
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
