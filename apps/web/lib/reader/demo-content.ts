export const DEMO_ARTICLE_HTML: Record<string, string> = {
  "designing-idempotent-apis": `
<h2>Why idempotency matters</h2>
<p>Payment APIs must survive retries. Networks fail, clients timeout, and users double-click. Without idempotency, every retry creates duplicate charges.</p>
<blockquote><p>Idempotency means performing the same operation multiple times produces the same result as performing it once.</p></blockquote>
<h2>The idempotency key pattern</h2>
<p>Clients send a unique key with each mutating request. The server stores the key and response for 24 hours.</p>
<pre><code class="language-go">func Charge(ctx context.Context, req ChargeRequest) (*Charge, error) {
    if existing, ok := store.Get(req.IdempotencyKey); ok {
        return existing, nil
    }
    charge, err := processor.Charge(req)
    if err != nil {
        return nil, err
    }
    store.Save(req.IdempotencyKey, charge)
    return charge, nil
}</code></pre>
<h3>Storage considerations</h3>
<p>Keys should expire, but not before clients stop retrying. Stripe uses a 24-hour window with request fingerprinting to detect key reuse with different payloads.</p>
<h2>Failure modes</h2>
<p>Race conditions happen when two identical requests arrive simultaneously. Use a database unique constraint or distributed lock on the idempotency key.</p>
<pre><code class="language-sql">CREATE UNIQUE INDEX idx_idempotency_keys
ON idempotency_keys (key, account_id);</code></pre>
<h3>Lessons learned</h3>
<ul>
  <li>Return the same HTTP status and body on replay</li>
  <li>Include the key in logs for debugging</li>
  <li>Reject keys reused with different request bodies</li>
</ul>
<p>Well-designed idempotency turns unreliable networks into a solved problem for your users.</p>
`,
};

export function getDemoContent(slug: string): string | undefined {
  return DEMO_ARTICLE_HTML[slug];
}
