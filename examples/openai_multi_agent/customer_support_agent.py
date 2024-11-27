import json
import os

from openai import OpenAI
from openai.types.chat import ChatCompletionMessageToolCall

import looplit as ll

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@ll.tool
def get_order_status(order_id: str) -> str:
    """Get the status for a given order id"""
    return "Everything is on track!"


def handle_tool_calls(state: ll.State, tool_calls: list[ChatCompletionMessageToolCall]):
    for tool_call in tool_calls:
        if tool_call.function.name == "get_order_status":
            result = get_order_status(**json.loads(tool_call.function.arguments))
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
def customer_support_agent(state: ll.State) -> ll.State:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=state.messages,
        tools=state.tools,
    )
    state.messages.append(response.choices[0].message)
    tool_calls = response.choices[0].message.tool_calls

    if tool_calls:
        handle_tool_calls(state, tool_calls)
        return customer_support_agent(state)
    else:
        return state


if __name__ == "__main__":
    final_state = customer_support_agent(csa_initial_state)
    print(final_state)
