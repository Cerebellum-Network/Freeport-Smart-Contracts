## Contract `BypassForwarder`






#### `verify(struct MinimalForwarder.ForwardRequest req, bytes signature) → bool` (public)

Verify that the sender has the `BYPASS_SENDER` role at the target contract,
and verifies that the request is properly signed (See `MinimalForwarder.verify`).




