type Props = {
    movie: any;
  };
  
  const MovieCard = ({ movie }: Props) => (
    <div style={{ width: 200, margin: 10 }}>
      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} style={{ borderRadius: 10 }} />
      <h4 style={{ color: '#fff' }}>{movie.title}</h4>
    </div>
  );
  
  export default MovieCard;