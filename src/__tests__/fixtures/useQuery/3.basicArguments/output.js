const MOVIE_QUERY = gql`
  query MovieQuery {
    GetMovie {
      id
      name
      year
      director {
        id
        name(firstOnly: true)
        age(format: "number")
        company {
          id
          name
        }
      }
    }
  }
`;

function Movie() {
  const { data } = useQuery("GetMovie");
  return (
    <div>
      <div>
        <p>{data.id}</p>
        <p>{data.name}</p>
        <p>{data.year}</p>
        <p>{data.director.id}</p>
        <p>
          {data.director.name({
            firstOnly: true,
          })}
        </p>
        <p>
          {data.director.age({
            format: "number",
          })}
        </p>
        <p>{data.director.company.id}</p>
        <p>{data.director.company.name}</p>
      </div>
    </div>
  );
}
