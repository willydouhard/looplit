import os

from dotenv import load_dotenv

env_found = load_dotenv(dotenv_path=os.path.join(os.getcwd(), ".env"))

from looplit.logger import logger

if env_found:
    logger.info("Loaded .env file")

from looplit.decorators import stateful, tool
from looplit.state import State

__all__ = ["State", "stateful", "tool"]
