import json
import os

from mistralai import Mistral

import looplit as ll

client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))


@ll.tool
async def get_order_status(order_id: str) -> str:
    """Get the status for a given order id"""
    return "in transit"


async def handle_tool_calls(state: ll.State, tool_calls):
    for tool_call in tool_calls:
        if tool_call.function.name == "get_order_status":
            result = await get_order_status(**json.loads(tool_call.function.arguments))
        else:
            continue

        state.messages.append(
            {
                "role": "tool",
                "content": f"{{'result': {result}}}",
                "name": tool_call.function.name,
                "tool_call_id": tool_call.id,
            }
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
    response = await client.chat.complete_async(
        model="mistral-large-latest",
        temperature=0,
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
    final_state = customer_support_agent(csa_initial_state)
    print(final_state)
