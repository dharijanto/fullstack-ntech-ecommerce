   const a= (
        <form onSubmit={this.addTodo} action="javascript:">
            <input value={text} onInput={this.setText} />
            <button type="submit">Add</button>
            <ul>
                { todos.map( todo => (
                    <li>{todo.text}</li>
                )) }
            </ul>
        </form>
    );
