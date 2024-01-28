import { useEffect, useState } from "react"
import personService from './services/persons'
import Notification from "./components/Notification"

const FilterInput = ({filterText, handleFilter}) => {
  return (
    <>
      filter shown with <input value={filterText} onChange={handleFilter}/>
    </>
  )

}

const PersonForm = ({addPerson, newName, handleChange, handleNumChange, newNum}) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={handleChange}/>
      </div>
      <div>
        number: <input value={newNum} onChange={handleNumChange}/>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const PersonsFilter = ({filterText, filterPersons, persons, toDelete}) => {

  const ifFiltered =
      <>
        {filterPersons.map(person => 
          <p key={person.id}>
            {person.name} {person.number} 
            <button onClick={() => toDelete(person)}>delete</button>
          </p>
        )}
      </>

  const notFiltered =
      <>
        {persons.map(person => 
          <p key={person.id}>
            {person.name} {person.number}
            <button onClick={() => toDelete(person)}>delete</button>
          </p>
        )}
      </>

  return (
    filterText.length > 0 ?
      ifFiltered :
      notFiltered
  )
}

//Maintain the application's state and all event handlers in the App root component.
const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNum, setNewNum] = useState('')
  const [filterText, setFilterText] = useState('')
  const [filterPersons, setFilterPersons] = useState([])
  const [message, setMessage] = useState(null)

  useEffect(() => {
    personService
    .getAll()
    .then(initialPersons => {
      setPersons(initialPersons)
    })
  }, [])
  
  const addPerson = (event) => {
    event.preventDefault()
    //if the name already exists but the number is different/same
    if (persons.find(p => p["name"] === newName)) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        // I don't need id I just need the specific person
        const findPerson = persons.find(person => person.name === newName)
        const changedPerson = {...findPerson, number: newNum}

        personService
        .update(findPerson.id, changedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(person => person.id !== findPerson.id ? person : returnedPerson))
        })
        .catch(() => {
            setMessage(`Information of ${newName} has already been removed from server`)
            setTimeout(() => {setMessage(null)}, 4000)
            setPersons(prevPersons => prevPersons.filter(person => person.id !== findPerson.id))
          }
        )

        setNewName('')
        setNewNum('')
      } // if user decided to abort cleans up the input
      setNewName('')
      setNewNum('')
      return false

    } else {
      const nameObject = {
        name: newName,
        number: newNum
      }
  
      personService
      .create(nameObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNum('')
      })
      .then( () => {
        setMessage(`Added ${newName}`)
        setTimeout(() => {setMessage(null)}, 3000)
      })
    }
  }

  const handleChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumChange = (event) => {
    console.log(event.target.value)
    setNewNum(event.target.value)
  }

  const handleFilter = (event) => {
    setFilterText(event.target.value)
    setFilterPersons(persons.filter( (person) => person.name.toLowerCase().includes(event.target.value.toLowerCase())))
  }

  const toDelete = (personToDelete) => {
    
    if (window.confirm(`Delete ${personToDelete.name}?`)) {
      console.log(`${personToDelete.name} was deleted`)
      
      //prevPersons is the current state of persons before changing bc setPersons can only modify persons
      //person.id !== personToDelete.id with the filter method, is used to create a new array that includes only the persons whose ID does not match the ID of the person to be deleted. This effectively removes the person with the matching ID from the array and also update it since updating state re-renders it.

      personService
      .toDelete(personToDelete.id)
      .then(() => {
          setPersons(prevPersons => prevPersons.filter(person => person.id !== personToDelete.id))
          setFilterText('')
        }
      )
    } setFilterText('')
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message}/>

      <FilterInput filterText={filterText} handleFilter={handleFilter}/>

      <h3>Add a new</h3>

      <PersonForm addPerson={addPerson} newName={newName} handleChange={handleChange} handleNumChange={handleNumChange} newNum={newNum}/>

      <h3>Numbers</h3>

      <PersonsFilter filterText={filterText} persons={persons}filterPersons={filterPersons} toDelete={toDelete}/>

    </div>
  )
}

export default App