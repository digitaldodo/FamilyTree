const fs = require('fs');

let content = fs.readFileSync('src/domain/inference/genealogy-engine.ts', 'utf8');

// Replace inferGenerations
const inferGenRegex = /inferGenerations\([^\{]+\{[\s\S]*?^  \},/m;
const newInferGen = \inferGenerations(nodes: FamilyGraphNode[], edges: FamilyGraphEdge[]) {
    const parentEdges = edges.filter(e => e.type === 'PARENT');
    
    const parentsOf = new Map<string, string[]>();
    for (const e of parentEdges) {
      if (!parentsOf.has(e.target)) parentsOf.set(e.target, []);
      parentsOf.get(e.target)!.push(e.source);
    }

    const roots = nodes.filter(n => !parentsOf.has(n.id) || parentsOf.get(n.id)!.length === 0);

    const genMap = new Map<string, number>();
    const visited = new Set<string>();
    const queue: { id: string, gen: number }[] = [];
    
    for (const root of roots) {
      queue.push({ id: root.id, gen: 0 });
      genMap.set(root.id, 0);
      visited.add(root.id);
    }

    if (roots.length === 0 && nodes.length > 0) {
      queue.push({ id: nodes[0].id, gen: 0 });
      genMap.set(nodes[0].id, 0);
      visited.add(nodes[0].id);
    }

    const childrenOf = new Map<string, string[]>();
    const spousesOf = new Map<string, string[]>();
    for (const e of edges) {
      if (e.type === 'PARENT') {
        if (!childrenOf.has(e.source)) childrenOf.set(e.source, []);
        childrenOf.get(e.source)!.push(e.target);
      } else if (e.type === 'SPOUSE') {
        if (!spousesOf.has(e.source)) spousesOf.set(e.source, []);
        if (!spousesOf.has(e.target)) spousesOf.set(e.target, []);
        spousesOf.get(e.source)!.push(e.target);
        spousesOf.get(e.target)!.push(e.source);
      }
    }

    while (queue.length > 0) {
      const { id: curr, gen: currGen } = queue.shift()!;
      
      const spouses = spousesOf.get(curr) || [];
      for (const sp of spouses) {
        if (!visited.has(sp)) {
          visited.add(sp);
          genMap.set(sp, currGen);
          queue.push({ id: sp, gen: currGen });
        }
      }

      const children = childrenOf.get(curr) || [];
      for (const child of children) {
        if (!visited.has(child)) {
          visited.add(child);
          genMap.set(child, currGen + 1);
          queue.push({ id: child, gen: currGen + 1 });
        }
      }
    }

    for (const n of nodes) {
      const gen = genMap.get(n.id);
      if (gen === undefined || gen === null || isNaN(gen)) {
        console.warn(\[GenealogyEngine] generation missing for member \. Assigning fallback 0\);
        n.generation = 0;
      } else {
        n.generation = gen;
      }
    }
  },\;

content = content.replace(/inferGenerations\(nodes: FamilyGraphNode\[\], edges: FamilyGraphEdge\[\]\) \{[\s\S]*?^  \},/m, newInferGen);

fs.writeFileSync('src/domain/inference/genealogy-engine.ts', content);
console.log('Done inferGenerations');
