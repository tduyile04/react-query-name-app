import React, { useState, useReducer, useContext } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
  useQueryClient,
  useMutation,
} from "react-query";

const BASE_URL = "http://localhost:8080";

const fetchUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/user`);
    const users = await response.json();
    return users;
  } catch (err) {
    console.log({ err });
    return [];
  }
};

const postUsers = async ({ name, email, bio }) => {
  try {
    const response = await fetch(`${BASE_URL}/user`, {
      method: "POST",
      body: JSON.stringify({ name, email, bio }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log({ response });
  } catch (err) {
    console.log({ err });
  }
};

const themes = {
  dark: { background: "grey" },
  light: { background: "white" },
};
const initialTheme = themes.light;
const ThemeContext = React.createContext();

function reducer(state, action) {
  switch (action.type) {
    case "LIGHT": {
      return {
        ...state,
        theme: themes.light,
      };
    }

    case "DARK": {
      return {
        ...state,
        theme: themes.dark,
      };
    }

    default: {
      return state;
    }
  }
}

function App() {
  const queryClient = new QueryClient();
  const [state, dispatch] = useReducer(reducer, { theme: initialTheme });

  const darkMode = () => dispatch({ type: "DARK" });
  const lightMode = () => dispatch({ type: "LIGHT" });

  return (
    <div style={{ background: state.theme.background }}>
      <ThemeContext.Provider value={{ darkMode, lightMode }}>
        <QueryClientProvider client={queryClient}>
          <Todo />
        </QueryClientProvider>
      </ThemeContext.Provider>
    </div>
  );
}

function Todo() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const usersQuery = useQuery("users", fetchUsers);

  const { isLoading, error, data } = usersQuery;

  const usersMutation = useMutation(postUsers, {
    onSuccess: () => {
      queryClient.invalidateQueries("users");
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    usersMutation.mutate({
      name,
      email,
      bio,
    });
  };

  return (
    <div>
      <Background />
      <form onSubmit={onSubmit}>
        <label htmlFor='name'>
          Name{" "}
          <input
            name='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label htmlFor='email'>
          Email{" "}
          <input
            name='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <label htmlFor='bio'>
          Bio{" "}
          <textarea
            name='bio'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <br />
        <button>Submit</button>
      </form>
      <section>
        <hr />
        <Loader isLoading={isLoading} />
        <Error error={error} />
        <UserList data={data} />
      </section>
    </div>
  );
}

function Loader({ isLoading }) {
  return isLoading && <div>Loading...</div>;
}

function Error({ error }) {
  return error && <div>An error occured fetching the data</div>;
}

function UserList({ data = [] }) {
  if (!Array.isArray(data) || data.length < 1) return null;
  return data.map(({ id, name, email, bio }) => {
    return (
      <div key={id}>
        <p>Name: {name}</p>
        <p>Email: {email}</p>
        <p>Bio: {bio}</p>
        <hr />
      </div>
    );
  });
}

function Background() {
  const { darkMode, lightMode } = useContext(ThemeContext);

  return (
    <div>
      <button onClick={lightMode}>Light</button>
      <button onClick={darkMode}>Dark</button>
    </div>
  );
}

export default App;
