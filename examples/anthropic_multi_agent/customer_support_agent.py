import json

import litellm

import looplit as ll


@ll.tool
async def get_order_status(order_id: str) -> str:
    """Get the status for a given order id"""
    return "Everything is on track!"


async def handle_tool_calls(state: ll.State, tool_calls):
    for tool_call in tool_calls:
        if tool_call.function.name == "get_order_status":
            result = await get_order_status(**json.loads(tool_call.function.arguments))
        else:
            continue

        state.messages.append(
            {"role": "tool", "content": result, "tool_call_id": tool_call.id}
        )


csa_initial_state = ll.State(
    messages=[
        {"role": "system", "content": "Customer Support Agent system prompt."},
    ],
    tools=[
        get_order_status.openai_schema,
    ],
)


@ll.stateful(init_state=csa_initial_state)
async def customer_support_agent(state: ll.State) -> ll.State:
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
        return await customer_support_agent(state)
    else:
        return state


if __name__ == "__main__":
    import asyncio

    csa_initial_state.messages.append({"role": "user", "content": "Status of order 2"})
    final_state = asyncio.run(customer_support_agent(csa_initial_state))
    print(final_state)
