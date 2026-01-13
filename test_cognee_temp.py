
import cognee
import asyncio

async def test():
    await cognee.add("Test document for verification")
    return "Success"

print(asyncio.run(test()))
