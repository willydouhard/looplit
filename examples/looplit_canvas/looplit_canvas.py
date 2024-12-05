import looplit as ll
import json
from looplit.canvas import canvas_agent, tool_defs, SYSTEM_PROMPT

flagged = {
    "role": "assistant",
    "content": None,
    "tool_calls": [{
        "id": "call_1",
        "type": "function",
        "function": {
            "name": "update_recurring_task",
            "arguments": "{\"title\": \"Team Meeting\", \"recurrence\": \"weekly\", \"day\": \"monday\", \"time\": \"10:00\"}"
        }
    }]
}

reasoning = ll.State(
    messages=[
        {"role": "system", "content": "You are a task management assistant."},
        {"role": "user", "content": "Schedule our weekly team meetings"},
        {"role": "assistant", "content": "I'll help you set that up. Do you have a preferred time?"},
        {"role": "user", "content": "Yes, every Monday at 10am"},
        flagged
    ],
    tools=[{
        "name": "create_recurring_task",
        "description": "Creates a new recurring task series",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "recurrence": {"type": "string", "enum": ["daily", "weekly", "monthly"]},
                "day": {"type": "string"},
                "time": {"type": "string"},
                "notify_participants": {"type": "boolean"}
            },
            "required": ["title", "recurrence", "day", "time", "notify_participants"]
        }
    }, {
        "name": "update_recurring_task",
        "description": "Updates an existing recurring task series",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "recurrence": {"type": "string"},
                "day": {"type": "string"},
                "time": {"type": "string"}
            }
        }
    }]
)

init_state = ll.State(
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT.format(
            flagged=json.dumps(flagged, indent=2),
            reasoning=reasoning.model_dump_json(indent=2)
            )},
        {"role": "user", "content": "The agent should have call 'create_recurring_task'."}
    ],
    tools=tool_defs,
)

_canvas_agent = ll.stateful(init_state)(canvas_agent)

if __name__ == "__main__":
    final_state = _canvas_agent(init_state)
    print(final_state)
