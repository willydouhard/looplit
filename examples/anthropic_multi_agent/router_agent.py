import json

import litellm
from customer_support_agent import csa_initial_state, customer_support_agent

import looplit as ll


@ll.tool
async def get_weather(city: str) -> str:
    """Get the weather for a given city"""
    return "10 degrees celsius"


@ll.tool
async def call_customer_support_agent(query: str) -> str:
    """Redirect to the Customer Support Agent"""
    csa_state = csa_initial_state.copy(deep=True)
    csa_state.messages.append({"role": "user", "content": query})
    result = await customer_support_agent(csa_state)
    return result.messages[-1].content


async def handle_tool_calls(state: ll.State, tool_calls):
    for tool_call in tool_calls:
        if tool_call.function.name == "get_weather":
            result = await get_weather(**json.loads(tool_call.function.arguments))
        elif tool_call.function.name == "call_customer_support_agent":
            result = await call_customer_support_agent(
                **json.loads(tool_call.function.arguments)
            )
        else:
            continue

        state.messages.append(
            {"role": "tool", "content": result, "tool_call_id": tool_call.id}
        )


initial_state = ll.State(
    messages=[
        {"role": "system", "content": "Router Agent system prompt."},
    ],
    tools=[get_weather.openai_schema, call_customer_support_agent.openai_schema],
)


@ll.stateful(init_state=initial_state)
async def router_agent(state: ll.State) -> ll.State:
    response = await litellm.acompletion(
        model="anthropic/claude-3-5-sonnet-20240620",
        max_tokens=1024,
        messages=state.messages,
        tools=state.tools,
    )
    state.messages.append(response.choices[0].message)
    tool_calls = response.choices[0].message.tool_calls
    if tool_calls:
        await handle_tool_calls(state, tool_calls)
        return await router_agent(state)
    else:
        return state


if __name__ == "__main__":
    import asyncio

    final_state = asyncio.run(router_agent(initial_state))
    print(final_state)
