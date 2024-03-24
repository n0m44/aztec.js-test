contract TestToken {
    use dep::aztec::prelude::{AztecAddress, NoteHeader, Map, PublicMutable, SharedImmutable};
    use dep::value_note::{balance_utils, value_note::ValueNote};
    use dep::easy_private_state::{EasyPrivateUint};
    use dep::compressed_string::{FieldCompressedString};

    struct Storage {
        balances: Map<AztecAddress, EasyPrivateUint>,
    }

    /**
    * initialize the contract's initial state variables.
    */
    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor(initial_supply: u64, contractOwner: AztecAddress) {
        assert(!contractOwner.is_zero(), "Invalid contract owner address");

        let balances = storage.balances;

        balances.at(contractOwner).add(initial_supply, contractOwner);
    }

    // Mints `amount` of tokens to `owner`.
    #[aztec(private)]
    fn mint(amount: u64, tokensOwner: AztecAddress) {
        let balances = storage.balances;

        balances.at(tokensOwner).add(amount, tokensOwner);
    }

    // Transfers `amount` of tokens from `sender` to a `recipient`.
    #[aztec(private)]
    fn transfer(amount: u64, sender: AztecAddress, recipient: AztecAddress) {
        let balances = storage.balances;

        balances.at(sender).sub(amount, sender);
        balances.at(recipient).add(amount, recipient);
    }

    // Helper function to get the balance of a user ("unconstrained" is a Noir alternative of Solidity's "view" function).
    unconstrained fn getBalance(owner: AztecAddress) -> pub Field {
        let balances = storage.balances;

        // Return the sum of all notes in the set.
        balance_utils::get_balance(balances.at(owner).set)
    }
}
