
class AppBaseException(Exception):
    def __init__(
            self, 
            message: str, 
            status_code: int = 500, 
            details: dict | None = None
        ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}("
            f"message={self.message!r}, "
            f"status_code={self.status_code}, "
            f"details={self.details})"
        )