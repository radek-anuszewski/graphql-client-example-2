import React, {useEffect, useState} from 'react';
import {gql, useMutation, useQuery, useSubscription} from "@apollo/client";

const AnimalData = ({name}) => {
  const {data} = useQuery(gql`
      query ($name: String!){
          animal(name: $name) {
              name
              birthPlace
          }
      }
  `, {
    variables: {
      name,
    }
  })

  if (!data) {
    return null;
  }

  return (
    <p>
      Name: {data.animal.name}
      <br />
      Birth place: {data.animal.birthPlace}
    </p>
  )
}

const Animal = ({name}) => {
  const [clicked, setClicked] = useState(false)

  if (!clicked) {
    return (
      <p>
        <button onClick={() => setClicked(true)}>
          {name}
        </button>
      </p>
    )
  }

  return <AnimalData name={name} />
}

const Animals = () => {
  const {data} = useQuery(gql`
      query {
          animals {
              name
          }
      }
  `);

  return (
    <p>
      Animals:
      {data?.animals.map(({name}) => (
        <Animal name={name} />
      ))}
    </p>
  )
}

const Owners = () => {
  const loadOwnersQuery = gql`
      query {
          owners {
              name
          }
      }
  `;

  const {data} = useQuery(loadOwnersQuery);

  const [createOwner] = useMutation(gql`
    mutation ($name: String!){
      createOwner(owner: {name: $name}) {
        id,
        name,
      }
    }
  `, {update: (store, request)=> {
      const data = store.readQuery({query: loadOwnersQuery})
      const createdOwner = request.data.createOwner
      const updatedOwners = [...data.owners, createdOwner]
      store.writeQuery({ query: loadOwnersQuery, data: {owners: updatedOwners}})
    }});

  const { data: subData } = useSubscription(gql`
      subscription onOwnerAdded {
          ownerAdded {
              id
          }
      }
  `)

  useEffect(() => {
    if (subData?.ownerAdded?.id) {
      alert(`Owner with id: ${subData.ownerAdded.id} added`);
    }
  }, [subData])

  const [name, setName] = useState('')

  const onSubmit = e => {
    e.preventDefault()
    createOwner({
      variables: {
        name,
      }
    })
    setName('')
  }

  return (
    <p>
      Owners:
      <div>
        {data?.owners.map(el => el.name).join(', ')}
      </div>
      <form onSubmit={onSubmit}>
        <input value={name} onChange={e => setName(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
    </p>
  )
}

const App = () => {
  return (
    <div>
      <Animals />
      <Owners />
    </div>
  );
}

export default App;
