SHELL := /bin/bash
CONTRACT_DIR := contracts

compile-contract:
	@echo "Compiling contract..."
	@cd ${CONTRACT_DIR} && \
	solcjs --abi --bin -o build OneTimeJobOffer.sol && \
	rm build/*system-contract*

