/* eslint-disable */
import { Connect, query } from "urql";

const movieQuery = createQuery();
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data);
        const film = DATA.movie("limit: 5");
        const nestedQuery = film.schedule("@sort", "id: 23", "@ping");
        return (
          <div>
            <Films data={film.titles} />
            <Schedule data={nestedQuery.data} />
          </div>
        );
      }}
    />
  </div>
);
