from fastapi import Request, status
from fastapi.responses import JSONResponse

class DomainException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class EntityNotFoundException(DomainException):
    def __init__(self, entity_name: str, identifier: str | int):
        message = f"{entity_name} with identifier '{identifier}' was not found."
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND)

class EligibilityValidationException(DomainException):
    def __init__(self, reasons: list[str]):
        message = f"Eligibility verification failed: {'; '.join(reasons)}"
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST)

class UnauthorizedException(DomainException):
    def __init__(self, message: str = "Could not validate authentication credentials."):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED)

class ForbiddenException(DomainException):
    def __init__(self, message: str = "You do not have required permissions to perform this action."):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN)

async def domain_exception_handler(request: Request, exc: DomainException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "path": request.url.path
        }
    )
