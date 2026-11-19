import { For } from "solid-js";

export interface SqlQueryData {
  readonly language: "js" | "py";
  readonly code: readonly string[];
  readonly columns: readonly string[];
  readonly rows: ReadonlyArray<readonly (string | number)[]>;
}

export default function SqlQuery(props: { data: SqlQueryData }) {
  return (
    <div class="sl-sql">
      <div class="sl-sql-head">
        <b>eval</b>
        <span>{props.data.language}</span>
      </div>
      <pre class="sl-sql-code">{props.data.code.join("\n")}</pre>
      <div class="sl-sql-out">
        <table>
          <thead>
            <tr>
              <For each={props.data.columns}>{(c) => <th>{c}</th>}</For>
            </tr>
          </thead>
          <tbody>
            <For each={props.data.rows}>
              {(row) => (
                <tr>
                  <For each={row}>{(v) => <td classList={{ num: typeof v === "number" }}>{v}</td>}</For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}
