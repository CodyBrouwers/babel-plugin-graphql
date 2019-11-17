import { Connect, query } from "urql";
import { createQuery, createFragment } from "blade.macro";

// MovieComponent.js
const movieFragment = createFragment("Movie");
const Movie = ({ data }) => {
  const result = movieFragment(data);
  const movie = result.movie;
  return (
    <div className="movie">
      {loaded === false ? (
        <p>Loading</p>
      ) : (
        <div>
          <h2>{movie.title}</h2>
          <p>{movie.actors.supporting}</p>
          <p>{movie.actors.leading}</p>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

Movie.fragment = movieFragment;

// MoviePage.js
const pageQuery = createQuery(); // create a top-level query
const App = () => (
  <Connect
    query={query(pageQuery)}
    children={({ loaded, data }) => {
      const result = pageQuery(data);
      // rendering Movie while adding
      // `Movie.fragment` into the query.
      // (could be automatic in future)
      return (
        <ul>
          <Movie data={result.movie(Movie.fragment)} />
        </ul>
      );
    }}
  />
);
