# Workflow

You are an agent - please keep going until the user’s query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.

If you are not sure about file content or codebase structure pertaining to the user’s request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.

You MUST iterate and keep going until the problem is solved. Only terminate your turn when you are sure that the problem is solved. Go through the problem step by step, and make sure to verify that your changes are correct. NEVER end your turn without having solved the problem, and when you say you are going to make a tool call, make sure you ACTUALLY make the tool call, instead of ending your turn.

## High-Level Problem Solving Strategy

1. Understand the problem deeply. Carefully read the issue and think critically about what is required.
2. Investigate the codebase. Explore relevant files, search for key functions, and gather context.
3. Develop a clear, step-by-step plan. Break down the fix into manageable, incremental steps.
4. Implement the fix incrementally. Make small, testable code changes.
5. Debug as needed. Use debugging techniques to isolate and resolve issues.
6. Test frequently. Run tests after each change to verify correctness.
7. Iterate until the root cause is fixed and all tests pass.
8. Reflect and validate comprehensively. After tests pass, think about the original intent, write additional tests to ensure correctness, and remember there are hidden tests that must also pass before the solution is truly complete.

Refer to the detailed sections below for more information on each step.

## 1. Deeply Understand the Problem

Carefully read the issue and think hard about a plan to solve it before coding.

## 2. Codebase Investigation

- Checkout the installed dependencies.
- Explore relevant files and directories.
- Search for key functions, classes, or variables related to the issue.
- Read and understand relevant code snippets.
- Identify the root cause of the problem.
- Validate and update your understanding continuously as you gather more context.

## 3. Develop a Detailed Plan

- Outline a specific, simple, and verifiable sequence of steps to fix the problem.
- Break down the fix into small, incremental changes.

## 4. Making Code Changes

- Before editing, always read the relevant file contents or section to ensure complete context.
- If a patch is not applied correctly, attempt to reapply it.
- Make small, testable, incremental changes that logically follow from your investigation and plan.

## 5. Debugging

- Make code changes only if you have high confidence they can solve the problem
- When debugging, try to determine the root cause rather than addressing symptoms
- Debug for as long as needed to identify the root cause and identify a fix
- Use print statements, logs, or temporary code to inspect program state, including descriptive statements or error messages to understand what's happening
- To test hypotheses, you can also add test statements or functions
- Revisit your assumptions if unexpected behavior occurs.

## 6. Testing

- Run tests frequently.
- After each change, verify correctness by running relevant tests.
- If tests fail, analyze failures and revise your patch.
- Write additional tests if needed to capture important behaviors or edge cases.
- Ensure all tests pass before finalizing.

## 7. Final Verification

- Confirm the root cause is fixed.
- Review your solution for logic correctness and robustness.
- Iterate until you are extremely confident the fix is complete and all tests pass.

## 8. Final Reflection and Additional Testing

- Reflect carefully on the original intent of the user and the problem statement.
- Think about potential edge cases or scenarios that may not be covered by existing tests.
- Write additional tests that would need to pass to fully validate the correctness of your solution.
- Run these new tests and ensure they all pass.
- Be aware that there are additional hidden tests that must also pass for the solution to be successful.
- Do not assume the task is complete just because the visible tests pass; continue refining until you are confident the fix is robust and comprehensive.

---

# Svelte 5 Runes & Patterns Reference

Use these patterns and examples to steer toward Svelte 5 idioms and away from deprecated Svelte 4 APIs.

## 1. Reactivity (Runes)

| Rune                | Purpose                                   | Example                                        |
| ------------------- | ----------------------------------------- | ---------------------------------------------- |
| **$state**          | Reactive primitives & deep proxies        | `let count = $state(0)`                        |
|                     |                                           | `let todos = $state([{…}])`                    |
| **$state.raw**      | Immutable snapshot                        | `let cfg = $state.raw({a:1,b:2})`              |
| **$state.snapshot** | Strip proxies for external libs           | `const snap = $state.snapshot(todos)`          |
| **$derived(expr)**  | Auto‑updating read‑only                   | `const dbl = $derived(count * 2)`              |
| **$derived.by(fn)** | Complex derived logic                     | `const sum = $derived.by(()=>arr.reduce(...))` |
| **$effect(fn)**     | Side‑effects when dependencies change     | `$effect(()=> console.log(count))`             |
| **$effect.pre(fn)** | Run before DOM updates (e.g. auto‑scroll) | `$effect.pre(()=>{/*…*/})`                     |

```ts
// deep reactive proxy
let todos = $state<{ text: string; done: boolean }[]>([{ text: 'Learn Svelte', done: false }]);

// immutable config
let cfg = $state.raw({ baseUrl: 'https://api.example.com' });

// snapshot for external lib
function send(data) {
	api.post('/save', $state.snapshot(todos));
}

// simple derived
const remaining = $derived(todos.filter((t) => !t.done).length);

// complex derived
const stats = $derived.by(() => ({
	total: todos.length,
	done: todos.filter((t) => t.done).length
}));

// side‑effect + cleanup
$effect(() => {
	console.log(`You have ${remaining} tasks left`);
	return () => console.clear();
});

// pre‑DOM update (auto‑scroll)
let chatContainer = $state<HTMLElement>();
let messages = $state<string[]>([]);
$effect.pre(() => {
	messages.length; // track length
	if (chatContainer) {
		tick().then(() => chatContainer.scrollTo(0, chatContainer.scrollHeight));
	}
});
```

## 2. Props & Binding

- **$props()**
  ```ts
  let { foo, bar = 'x' } = $props(); // destructure + defaults
  ```
- **$bindable**
  ```svelte
  let {(value = $bindable())} = $props();
  <input bind:value />
  <!-- two‑way -->
  ```
- **Unique IDs**
  ```ts
  const uid = $props.id(); // stable per instance
  ```

```ts
// destructure + defaults + bindable
<script lang="ts">
  interface Props { value?: string; disabled?: boolean }
  let { value = $bindable(''), disabled = $bindable(false) }: Props = $props();
</script>

<input bind:value bind:disabled />
```

```ts
// unique IDs
const uid = $props.id();

// pass callback prop
let { onSave }: { onSave: (data: any) => void } = $props();
<button onclick={() => onSave($state.snapshot(todos))}>Save</button>
```

## 3. Event Handling

- **Inline handlers**
  ```svelte
  <button onclick={(e) => count++}>…</button>
  ```
- **Shorthand** (named `onclick`)
  ```svelte
  function onclick() {count++}
  <button {onclick}>…</button>
  ```
- **Callback props** (no `createEventDispatcher`)
  ```svelte
  <!-- Child.svelte -->
  let {onAction} = $props();
  <button onclick={() => onAction(data)}>Do</button>
  ```
- **Modifiers** (manual wrappers)
  ```ts
  const once = (fn) => (e) => {
  	fn(e);
  	fn = null;
  };
  const preventDefault = (fn) => (e) => {
  	e.preventDefault();
  	fn(e);
  };
  ```
- **Multiple handlers**
  ```svelte
  <button
  	onclick={(e) => {
  		a(e);
  		b(e);
  	}}>…</button
  >
  ```
- **Spread + merge**
  ```svelte
  <button
  	{...props}
  	onclick={(e) => {
  		local(e);
  		props.onclick?.(e);
  	}}
  />
  ```

```svelte
<script lang="ts">
	let count = $state(0);
	function onclick() {
		count += 1;
	} // shorthand
	const preventOnce = once(preventDefault(() => alert('Clicked!')));
</script>

<button {onclick}>Clicked {count}</button>
<button onclick={preventOnce}>Once & no default</button>
```

```svelte
<!-- merge props + local -->
<script lang="ts">
	let props = $props<{ onclick?: (e: MouseEvent) => void }>();
	function local(e: MouseEvent) {
		console.log('local');
	}
</script>

<button
	{...props}
	onclick={(e) => {
		local(e);
		props.onclick?.(e);
	}}
>
	Combined
</button>
```

## 4. Snippets (Slots Replacement)

- **Define**
  ```svelte
  {#snippet item(d)}
  	<li>{d}</li>
  {/snippet}
  ```
- **Render**
  ```svelte
  {@render item(fruit)}
  ```
- **Pass to components**
  ```svelte
  <Table {header} {row} />
  ```

```svelte
{#snippet header()}
	<h1>{title}</h1>
{/snippet}

{#snippet row(item)}
	<tr>
		<td>{item.name}</td>
		<td>{item.qty}</td>
	</tr>
{/snippet}

<Table data={items} {header} {row} />
```

## 5. Advanced APIs

- **$host()**
  ```ts
  $host().dispatchEvent(new CustomEvent('evt'));
  ```
- **$inspect**
  ```ts
  $inspect(count, todos);              // log changes
  $inspect(count).with((t,v)=>…);      // custom
  $inspect.trace();                    // inside $effect
  ```

```ts
// dispatch from custom element
<svelte:options customElement="x-chart" />
<script lang="ts">
  function update(data) {
    $host().dispatchEvent(new CustomEvent('update', { detail: data }));
  }
</script>
```

```ts
// inspect + trace
let stateA = $state(0),
	stateB = $state(0);
$inspect(stateA, stateB).with((type, ...vals) => console.log(type, vals));
$effect(() => {
	$inspect.trace();
	doWork();
});
```

## 6. TypeScript Patterns

- **Enable**: `<script lang="ts">`
- **Typed props**
  ```ts
  interface Props {
  	name: string;
  }
  let { name }: Props = $props();
  ```
- **Generic components**
  ```svelte
  <script lang="ts" generics="T">
  	interface Props {
  		items: T[];
  		onSelect: (t: T) => void;
  	}
  	let { items, onSelect }: Props = $props();
  </script>
  ```
- **Typed state**
  ```ts
  let count: number = $state(0);
  ```

```svelte
<script lang="ts" generics="Item">
	interface Props {
		items: Item[];
		renderItem: (item: Item) => any;
		onSelect: (item: Item) => void;
	}
	let { items, renderItem, onSelect }: Props = $props();
</script>

<ul>
	{#each items as it}
		<li onclick={() => onSelect(it)}>{@render renderItem(it)}</li>
	{/each}
</ul>
```

```ts
// typed state + derived
let count: number = $state(0);
const parity: 'even' | 'odd' = $derived(count % 2 === 0 ? 'even' : 'odd');
```

## 7. Migration Mapping

| Svelte 4                      | Svelte 5                                 |
| ----------------------------- | ---------------------------------------- |
| `$:` labels                   | `$state` / `$derived` / `$effect`        |
| `<slot>`                      | `#snippet` / `@render`                   |
| `on:click`                    | `onclick={…}` / `{onclick}`              |
| `createEventDispatcher`       | callback props + `$host()` for custom el |
| `$on/$set/$destroy`           | event props / direct state / `unmount`   |
| `<svelte:component this={C}>` | `<C/>` with `$state`                     |

## 8. **Complex Mixed Example: Collaborative Todo App**

```svelte
<!-- App.svelte -->
<script lang="ts">
	import TodoList from './TodoList.svelte';
	let todos = $state<{ text: string; done: boolean }[]>([]);

	function add(text: string) {
		todos.push({ text, done: false });
	}

	function save(snapshot) {
		/* send to server */
	}
</script>

<TodoList {todos} onAdd={add} onSave={save} />
```

```svelte
<!-- TodoList.svelte -->
<script lang="ts">
	export interface Todo {
		text: string;
		done: boolean;
	}
	interface Props {
		todos: Todo[];
		onAdd: (t: string) => void;
		onSave: (snap: Todo[]) => void;
	}
	let { todos, onAdd, onSave }: Props = $props();

	let input = $state('');
	const remaining = $derived(todos.filter((t) => !t.done).length);

	$effect(() => console.log(`Remaining: ${remaining}`));

	function handleAdd() {
		onAdd(input.trim());
		input = '';
	}
</script>

{#snippet controls()}
	<input bind:value onkeydown={(e) => e.key === 'Enter' && handleAdd()} placeholder="New task" />
	<button onclick={handleAdd}>Add</button>
	<button onclick={() => onSave($state.snapshot(todos))}>Sync</button>
{/snippet}

{#snippet item(todo, idx)}
	<li>
		<input type="checkbox" bind:checked={todo.done} />
		{todo.text}
	</li>
{/snippet}

<div>
	<p>{remaining} open tasks</p>
	<ul>
		{#each todos as t, i}
			{@render item(t, i)}
		{/each}
	</ul>
	{@render controls()}
</div>
```
