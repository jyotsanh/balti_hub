import argparse

import uvicorn
from loguru import logger

from apps.backend.src.config import settings


def dev():
    """
    runs the server in development mode
    """
    logger.info("running server in **development** mode")
    uvicorn.run(
        "src.server:app",
        host=settings.DEV_HOST,
        port=settings.DEV_PORT,
        reload=True
    )


def server():
    """
    runs the server in production mode
    """
    logger.info("running server in **production** mode")
    uvicorn.run(
        "src.server:app",
        host=settings.PROD_HOST,
        port=settings.PROD_PORT
    )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the server")
    parser.add_argument(
        "--env",
        choices=["dev", "prod"],
        default="dev",
        help="Environment to run: 'dev' (default) or 'prod'"
    )
    args = parser.parse_args()

    if args.env == "prod":
        server()
    else:
        dev()
