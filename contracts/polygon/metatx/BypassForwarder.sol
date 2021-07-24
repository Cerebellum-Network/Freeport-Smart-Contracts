// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../access/AccessControl.sol";
import "./MinimalForwarder.sol";

/* `BypassForwarder` is a variant of `MinimalForwarder` used to forward transactions that bypass royalties.
 * Besides that, it works the same way as the basic meta-transaction forwarder.
 *
 * This contract is supposed to have the role `BYPASS_SENDER` in the target contract.
 * It will verify that the relayer sending the transaction also has this role.
 */
contract BypassForwarder is MinimalForwarder {

    bytes32 public constant BYPASS_SENDER = keccak256("BYPASS_SENDER");

    /** Verify that the sender has the `BYPASS_SENDER` role at the target contract,
     * and verifies that the request is properly signed (See `MinimalForwarder.verify`).
     */
    function verify(ForwardRequest calldata req, bytes calldata signature) public view override returns (bool) {
        IAccessControl target = IAccessControl(req.to);
        bool hasBypassRole = target.hasRole(BYPASS_SENDER, msg.sender);
        if (!hasBypassRole) return false;

        return super.verify(req, signature);
    }
}
