import json
import os

from openai import OpenAI
from openai.types.chat import ChatCompletionMessageToolCall

import looplit as ll

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@ll.tool
def file_search(directory: str, pattern: str):
    """Searches for files matching pattern in given directory.Returns list of matching file paths"""
    return ["sales_data.csv"]

@ll.tool
def analyze_csv(filepath: str):
    """Reads CSV file and performs statistical analysis"""
    return {"revenue": {"mean": 0.5, "min": 0, "max": 1, "sum": 2}}

@ll.tool
def text_search(filepath: str, keyword: str):
    """Searches a file"""
    return [1, 2]


tool_map = {
    "file_search": file_search,
    "analyze_csv": analyze_csv,
    "text_search": text_search
}


def handle_tool_calls(state: ll.State, tool_calls: list[ChatCompletionMessageToolCall]):
    for tool_call in tool_calls:
        if tool_call.function.name in tool_map:
            result = tool_map[tool_call.function.name](**json.loads(tool_call.function.arguments))
        else:
            continue

        state.messages.append(
            {"role": "tool", "content": json.dumps(result), "tool_call_id": tool_call.id}
        )


initial_state = ll.State(
    messages=[
        {"role": "system", "content": "You are a helpful virtual assistant focused on data analysis and file management. Be direct and informative in your responses."},
    ],
    tools=[t.openai_schema for t in tool_map.values()],
)


@ll.stateful(init_state=initial_state)
def file_agent(state: ll.State) -> ll.State:
    response = client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        messages=state.messages,
        tools=state.tools,
    )
    state.messages.append(response.choices[0].message)
    tool_calls = response.choices[0].message.tool_calls
    if tool_calls:
        handle_tool_calls(state, tool_calls)
        return file_agent(state)
    else:
        return state


if __name__ == "__main__":
    final_state = file_agent(initial_state)
    print(final_state)
