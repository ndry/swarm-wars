function Map_getOrCreate<K, V>(map: Map<K, V>, key: K, valueFactory: (key: K) => V): V {
    if (map.has(key)) {
        return map.get(key);
    } else {
        const value = valueFactory(key);
        map.set(key, value);
        return value;
    }
}

export interface Chunk<TEntry> {
    position: {
        x: number,
        y: number
    }
    entries: TEntry[]
}

export class ChunkManager<TEntry> {
    chunkSide: number;
    chunks = new Map<string, Chunk<TEntry>>();

    constructor(
        chunkside: number
    ) {
        this.chunkSide = chunkside;
    }

    cid(x: number, y: number) {
        return `${Math.round(y / this.chunkSide)} @ ${Math.round(x / this.chunkSide)}`;
    }

    put(x: number, y: number, entry: TEntry) {
        const chunk = Map_getOrCreate(this.chunks, this.cid(x, y), () => ({
            position: {
                x: Math.round(x / this.chunkSide) * this.chunkSide,
                y: Math.round(y / this.chunkSide) * this.chunkSide,
            },
            entries: []
        }))
        chunk.entries.push(entry);
    }

    getChunk(x: number, y: number) {
        return this.chunks.get(this.cid(x, y));
    }

    * enumerateAll() {
        yield* this.chunks.values();
    };

    * enumerateChunk(x: number, y: number){
        yield* this.getChunk(x, y).entries;
    };

    * enumerateSquare(x: number, y: number, r: number) {
        for (let dx = -r; dx <= r; dx += this.chunkSide) {
            for (let dy = -r; dy <= r; dy += this.chunkSide) {
                const chunk = this.getChunk(x + dx, y + dy);
                if (!chunk) { continue; }
                yield* chunk.entries;
            }   
        }
    }
}

