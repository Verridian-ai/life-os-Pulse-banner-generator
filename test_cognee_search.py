
import cognee
import asyncio

async def test():
    results = await cognee.search("test")
    return f"Found {len(results)} results"

print(asyncio.run(test()))
