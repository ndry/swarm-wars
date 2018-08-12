function Map_getOrCreate<K, V>(map: Map<K, V>, key: K, valueFactory: (key: K) => V): V {
    let value = map.get(key);
    if (!value) {
        value = valueFactory(key);
        map.set(key, value);
    }
    return value;
}

export interface Chunk<TEntry> {
    position: {
        x: number,
        y: number,
    };
    entries: TEntry[];
}

interface Position {
    x: number;
    y: number;
}

export class ChunkManager<TEntry> {
    chunkSide: number;
    chunks = new Map<string, Chunk<TEntry>>();

    constructor(
        chunkside: number,
    ) {
        this.chunkSide = chunkside;
    }

    cid(p: Position) {
        return `${Math.round(p.y / this.chunkSide)} @ ${Math.round(p.x / this.chunkSide)}`;
    }

    put(p: Position, entry: TEntry) {
        const chunk = Map_getOrCreate(this.chunks, this.cid(p), () => ({
            position: {
                x: Math.round(p.x / this.chunkSide) * this.chunkSide,
                y: Math.round(p.y / this.chunkSide) * this.chunkSide,
            },
            entries: [],
        }));
        chunk.entries.push(entry);
    }

    getChunk(p: Position) {
        return this.chunks.get(this.cid(p));
    }

    * enumerateAll() {
        for (const chunk of this.chunks.values()) {
            yield* chunk.entries;
        }
    }

    * enumerateChunk(p: Position) {
        const chunk = this.getChunk(p);
        if (chunk) {
            yield* chunk.entries;
        }
    }

    * enumerateSquare(p: Position, r: number) {
        for (let dx = -r; dx <= r; dx += this.chunkSide) {
            for (let dy = -r; dy <= r; dy += this.chunkSide) {
                yield* this.enumerateChunk({ x: p.x + dx, y: p.y + dy });
            }
        }
    }
}
