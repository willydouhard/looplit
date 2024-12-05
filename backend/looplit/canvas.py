import os
import json
from looplit.decorators import tool
from looplit.state import State
from looplit.context import get_context

SYSTEM_PROMPT = """You are an AI assistant specialized in analyzing and debugging LLM agent outputs. Your purpose is to identify issues in agent reasoning and suggest improvements to prevent similar problems.

Input:
<agent-reasoning>
{reasoning}
</agent-reasoning>
<flagged>
{flagged}
</flagged>

Task:

Analyze the root cause of the issue described by the user given the flagged part of the reasoning.
If possible, edit the instructions of the Agent. The goal is to change the instructions (root cause) to avoid the issue in a future run.
Given those modifications, replaying the state should lead to the correct result.
"""

@tool
async def update_system_prompt(
    old_str: str,
    new_str: str,
   ) -> str:
    """Update the system message in the agent reasoning `messages` field."""
    try:
        context = get_context()
        await context.session.send_state_edit(old_str=old_str, new_str=new_str)
    except:
        pass
    return "System prompt update suggested!"


@tool
async def update_tool_definition(
    old_str: str,
    new_str: str,
   ) -> str:
    """Update a tool call definition in the agent reasoning `tools` field. You cannot edit tool names."""
    try:
        context = get_context()
        await context.session.send_state_edit(old_str=old_str, new_str=new_str)
    except:
        pass
    return "Tool definition update suggested!"


tool_defs = [
    update_system_prompt.openai_schema,
    update_tool_definition.openai_schema,
]

async def handle_tool_calls(state: State, tool_calls):
    for tool_call in tool_calls:
        if tool_call.function.name == "update_system_prompt":
            result = await update_system_prompt(**json.loads(tool_call.function.arguments))
        elif tool_call.function.name == "update_tool_definition":
            result = await update_tool_definition(**json.loads(tool_call.function.arguments))
        else:
            continue

        state.messages.append(
            {"role": "tool", "content": result, "tool_call_id": tool_call.id}
        )

async def canvas_agent(state: State) -> State:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = await client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        messages=state.messages,
        tools=state.tools,
    )
    state.messages.append(response.choices[0].message)
    tool_calls = response.choices[0].message.tool_calls

    if tool_calls:
        await handle_tool_calls(state, tool_calls)
        return await canvas_agent(state)
    else:
        return state
