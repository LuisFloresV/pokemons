const axios = require('axios');

const LIMIT = 200;

exports.getAllPokemons = async () => {
  try {
    const first = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${LIMIT}`);
    const count = first.data.count;

    const requests = [];

    let pokemons = [...first.data.results];

    for (let offset = LIMIT; offset < count; offset += LIMIT) {
      requests.push(
        axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${LIMIT}`)
      );
    }

    const responses = await Promise.all(requests);

    responses.forEach(res => {
      pokemons.push(...res.data.results);
    });

    const detailedPokemon = []

    for (let i = 0; i < pokemons.length; i += LIMIT) {
      const batch = pokemons.slice(i, i + LIMIT);

      await Promise.all(
        batch.map(async (pokemon) => {
          const { data } = await axios.get(pokemon.url);
          const abilities = data.abilities.map((a) => a.ability.name);

          detailedPokemon.push({
            name: pokemon.name,
            abilities,
          });
        })
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify(detailedPokemon),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'Something went wrong' }),
    };
  }
}

