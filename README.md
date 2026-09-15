# llm-wait-injector

**WARNING: Do not clone this repository directly to build an extension. To start a new project, use the [llm-wait-injector-template](https://github.com/SalvadorCorreia/llm-wait-injector-template) repository.**

This is the core injection engine for LLM wait-state browser extensions. It operates as a Git Submodule dependency. It monitors LLM interfaces (like ChatGPT or Claude), detects generation wait states, and handles the lifecycle of injecting custom payloads.

## Project Structure

- `src/`: The core engine. Contains the injector logic and the provider registry.
- `src/providers/`: Target selectors for specific LLM websites.

## Usage

This codebase is not a standalone browser extension and does not contain a `manifest.json`. 

To build an extension using this engine, create a new repository from [llm-wait-injector-template](https://github.com/SalvadorCorreia/llm-wait-injector-template). That template is pre-configured to pull this repository as a submodule.

## Contributing a New LLM Provider

To add native support for a new LLM website to the core engine:
1. Use the `dev/prompt_template.md` file. You can provide this template to an LLM alongside the target website's HTML structure to automatically generate the necessary provider code.
2. Save the resulting file in `src/providers/` (e.g., `new-ai.js`).
