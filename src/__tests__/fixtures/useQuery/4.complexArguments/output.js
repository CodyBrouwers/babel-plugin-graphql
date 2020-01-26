const _MOVIE__GETMOVIEQUERY = gql`
  query Movie__GetMovieQuery {
    GetMovie {
      id
      name
      year
      director {
        id
        _name: name(firstOnly: true) @preload
        _age: age(format: "number") @cache {
          formatted
        }
        company {
          id
          name
        }
      }
    }
  }
`;

function Movie() {
  const { data } = useQuery(_MOVIE__GETMOVIEQUERY);
  return (
    <div>
      <div>
        <p>{data.id}</p>
        <p>{data.name}</p>
        <p>{data.year}</p>
        <p>{data.director.id}</p>
        <p>{data.director._name}</p>
        <p>{data.director._age.formatted}</p>
        <p>{data.director.company.id}</p>
        <p>{data.director.company.name}</p>
      </div>
    </div>
  );
}
