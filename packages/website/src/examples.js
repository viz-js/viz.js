const EXAMPLES = {
  "Simple": `digraph {
  a -> b
}
`,
  "Clusters": `digraph {
  node [shape=rect];
  subgraph {
    cluster=true;
    color=blue;
    node [
      shape=ellipse,
      style=filled,
      color=blue,
      fontcolor=white
    ];
    a1 -> a2 -> a3;
  }
  subgraph {
    cluster=true;
    bgcolor=lightgreen;
    node [
      shape=ellipse,
      style=filled,
      color=yellow,
      fontcolor=black
    ];
    b1 -> b2 -> b3;
    b2:e -> b1;
    b2 [shape=diamond];
  }
  start -> a1;
  start -> b1;
  a3 -> end;
  b3 -> end;
  start [style=filled, color=green, fontcolor=white];
  end [color=red];
}
`,
  "LR(1) Automaton": `digraph {
  graph [rankdir=LR];
  node [shape=record];
  0 [label="0 | [&bull; S, $]\\n[S &rarr; &bull; a S b, $]\\n[S &rarr; &bull;, $]"];
  1 [label="1 | [S &bull;, $]"];
  2 [label="2 | [S &rarr; a &bull; S b, $]\\n[S &rarr; &bull; a S b, b]\\n[S &rarr; &bull;, b]"];
  3 [label="3 | [S &rarr; a S &bull; b, $]"];
  4 [label="4 | [S &rarr; a &bull; S b, b]\\n[S &rarr; &bull; a S b, b]\\n[S &rarr; &bull;, b]"];
  5 [label="5 | [S &rarr; a S b &bull;, $]"];
  6 [label="6 | [S &rarr; a S &bull; b, b]"];
  7 [label="7 | [S &rarr; a S b &bull;, b]"];
  0 -> 1 [label=S];
  0 -> 2 [label=a];
  2 -> 3 [label=S];
  2 -> 4 [label=a];
  3 -> 5 [label=b];
  4 -> 6 [label=S];
  4 -> 4 [label=a];
  6 -> 7 [label=b];
}
`
};

export function getExampleNames() {
  return Object.keys(EXAMPLES);
}

export function getExample(name) {
  return EXAMPLES[name];
}

export const defaultExampleName = "Simple";
