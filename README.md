# Welcome to Looplit 🔁💡

[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/chainlit_io.svg?style=social&label=Follow%20%40chainlit_io)](https://twitter.com/chainlit_io)

**Looplit is an unopinionated Agent Studio.**

https://github.com/user-attachments/assets/37a69f13-a2f2-4c5b-85c2-24e2c867dfc3

## 🤔 Why Looplit?

In the current landscape, much of the community's focus is on Agent frameworks. 

Looplit's thesis is that orchestration should primarily be handled by the LLM (think LLM + tools + while loop).

Developers don't need yet another framework but rather tooling to debug, replay, and interact with Agents effectively.

## 💁 Who is Looplit for?

Looplit is designed for developers who:

1. Spend time tuning prompts and tool definitions to improve agents
2. Need to replay and debug agents using production traces

#### 🙅 Looplit is not
- An orchestration framework
- A memory management system
- An LLM library

#### 🔧 Core Features

- 💬 **Message-Based UI**: Interact seamlessly with an Agent.
- ⤵️ **State Fork**: Create branches in your agent's state.
- ⏱️ **Time Travel**: Navigate through different states in time.
- 💾 **Save/Upload States**: Persist and share agent states.

## How Does It Work

Looplit's time travel and forking capabilities rely on a state-in, state-out pattern. Your agent function should be structured as follows:

```python
import looplit as ll

init_state = ll.State()

@ll.stateful(init_state=init_state)
def my_agentic_function(state: ll.State) -> ll.State:
    # ... agentic work here
    state.messages.append({
        "role": "assistant",
        "content": "My super smart agent response"})
    return state
```

The `@ll.stateful` decorator makes Looplit aware of your function. If the code isn't run with the `looplit` command, it will simply return the original function.

The [ll.State](/backend/looplit/state/__init__.py) class is a straightforward Pydantic model. Each function invocation takes the previous state and returns a new one.

```py
from pydantic import BaseModel, Field


class State(BaseModel):
    # This field is handled by Looplit
    id: str = Field(default_factory=lambda: str(uuid4()))

    # Messages HAVE to follow the OpenAI schema for now
    messages: List[Any] = Field(default_factory=list)
    tools: Optional[List[Any]] = None
```

You can and should extend this class to include any relevant information your agent needs.

> **_Note:_** The `ll.State` class must be JSON serializable.

## ⌨️ Get Started

Install the latest version:

> **_Note:_** The package is not released yet. You will need `pnpm` to build locally.

```sh
pip install git+https://github.com/willydouhard/looplit.git#subdirectory=backend/
```

Start the Agent Studio:

```sh
looplit my_agent.py
```

Where `my_agent.py` is the file containing your `@ll.stateful` decorated functions.

The `looplit` command will start a FastAPI server serving your agentic functions and exposing the Studio UI on http://localhost:8000.

## 🤖 Examples

Looplit doesn't dictate how you should code your agent, but here are two simple examples showcasing a router agent capable of calling another agent:

1. [OpenAI Sync Example](./examples/openai_multi_agent/)
2. [LiteLLM (Anthropic) Async Example](./examples/anthropic_multi_agent/)

## 🤙 Multi Agent Systems

The examples above demonstrate a common pattern involving a router Agent that can call other Agents through tools. Looplit supports this pattern provided:

1. The sub-agent is decorated with `@ll.stateful`.
2. The tool call name follows the `call_{sub_agent_function_name}` convention.

## 🛣️ What's Next?

- [ ] AI enabled iteration/debugging
- [ ] Voice Support

## 💡 Why is it Named Looplit?

We believe that Agents are essentially while **loops** (or recursions) + llm + tools. Looplit is created by the authors of [Chain**lit**](https://github.com/Chainlit/chainlit) and [**Lit**eral AI](https://www.literalai.com/).

---

Feel free to contribute, raise issues, or suggest improvements. Happy coding! 🚀
