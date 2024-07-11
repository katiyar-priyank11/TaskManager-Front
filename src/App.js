import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import styles from './App.module.css';

const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      name
      link
      revisionPrimary
      revisionSecondary
    }
  }
`;

const ADD_TASK = gql`
  mutation AddTask($name: String!, $link: String!) {
    addTask(name: $name, link: $link) {
      id
      name
      link
      revisionPrimary
      revisionSecondary
    }
  }
`;

const EDIT_TASK = gql`
  mutation EditTask($id: ID!, $name: String!, $link: String!) {
    editTask(id: $id, name: $name, link: $link) {
      id
      name
      link
      revisionPrimary
      revisionSecondary
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
      name
      link
      revisionPrimary
      revisionSecondary
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $revisionPrimary: Boolean, $revisionSecondary: Boolean) {
    updateTask(id: $id, revisionPrimary: $revisionPrimary, revisionSecondary: $revisionSecondary) {
      id
      revisionPrimary
      revisionSecondary
    }
  }
`;

const App = () => {
  const { loading, error, data } = useQuery(GET_TASKS);
  const [addTask] = useMutation(ADD_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });
  const [editTask] = useMutation(EDIT_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });
  const [deleteTask] = useMutation(DELETE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });
  const [updateTask] = useMutation(UPDATE_TASK);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [editId, setEditId] = useState(null);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !link) {
      alert('Please provide both name and link');
      return;
    }
    addTask({ variables: { name, link } });
    setName('');
    setLink('');
    setIsModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name || !link) {
      alert('Please provide both name and link');
      return;
    }
    editTask({ variables: { id: editId, name, link } });
    setName('');
    setLink('');
    setEditId(null);
    setEditModalOpen(false);
  };

  const handleEditClick = (task) => {
    setEditId(task.id);
    setName(task.name);
    setLink(task.link);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask({ variables: { id } });
    }
  };

  const handleCheckboxChange = (id, field, value) => {
    updateTask({ variables: { id, [field]: value } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div className={styles.container}>
      <h1>Task Manager</h1>
      <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>Add Problem</button>
      
      {isModalOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsModalOpen(false)}></div>
          <div className={styles.modal}>
            <form onSubmit={handleAddSubmit}>
              <input
                className={styles.inputField}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Problem Name"
                required
              />
              <input
                className={styles.inputField}
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Problem Link"
                required
              />
              <button type="submit" className={styles.modalButton}>Add</button>
            </form>
          </div>
        </>
      )}

      {editModalOpen && (
        <>
          <div className={styles.overlay} onClick={() => setEditModalOpen(false)}></div>
          <div className={styles.modal}>
            <form onSubmit={handleEditSubmit}>
              <input
                className={styles.inputField}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Problem Name"
                required
              />
              <input
                className={styles.inputField}
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Problem Link"
                required
              />
              <button type="submit" className={styles.modalButton}>Save Changes</button>
            </form>
          </div>
        </>
      )}

      <ul className={styles.taskList}>
        {data.tasks.map((task) => (
          <li key={task.id} className={styles.taskItem}>
            <p className={styles.taskName}>{task.name}</p>
            <a className={styles.taskLink} href={task.link} target="_blank" rel="noopener noreferrer">
              🔗
            </a>
            <div className={styles.checkboxContainer}>
              <label>
                <input
                  type="checkbox"
                  checked={task.revisionPrimary}
                  onChange={(e) => handleCheckboxChange(task.id, 'revisionPrimary', e.target.checked)}
                />
                Revision 1
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={task.revisionSecondary}
                  onChange={(e) => handleCheckboxChange(task.id, 'revisionSecondary', e.target.checked)}
                />
                Revision 2
              </label>
            </div>
            <div className={styles.editDeleteButtons}>
              <button className={styles.editButton} onClick={() => handleEditClick(task)}>Edit</button>
              <button className={styles.deleteButton} onClick={() => handleDeleteClick(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
