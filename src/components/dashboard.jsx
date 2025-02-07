import React, { useEffect, useState } from 'react';
import { MdOutlineDashboard } from "react-icons/md";
import { Button, Modal, Box, TextField, Typography, Pagination } from '@mui/material';
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

function Dashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ id: "", name: "", email: "", username: "" });
  const [page, setPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.escuelajs.co/api/v1/users');
        setData(response.data);
      } catch (e) {
        console.log(e.message);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    (item.name + item.id).toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredData.length / usersPerPage);
  const paginatedUsers = filteredData.length > 10? filteredData.slice((page - 1) * usersPerPage, page * usersPerPage): filteredData;
  

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => {
      const updatedFormData = { ...prevFormData, [name]: value };
      if (name === 'name' || name === 'id') {
        updatedFormData.username = `${updatedFormData.name}${updatedFormData.id}`;
      }
      return updatedFormData;
    });
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({ id: "", name: "", email: "", username: "" });
    setOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditMode(true);
    setSelectedUser(user);
    setFormData({ id: user.id, name: user.name, email: user.email, username: `${user.name}${user.id}` });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editMode) {
      const updatedData = data.map(user =>
        user.id === selectedUser.id ? { ...user, ...formData } : user
      );
      setData(updatedData);
    } else {
      const newUser = { id: uuidv4(), name: formData.name, email: formData.email, username: `${formData.name}${formData.id}` };
      setData([newUser, ...data]);
    }
    setOpen(false);
    setFormData({ id: "", name: "", email: "", username: "" });
  };

  return (
    <div className="p-4">
      <div className='bg-emerald-400 p-4 text-white flex items-center justify-center md:justify-start'>
        <MdOutlineDashboard />
        <h1 className='pl-4 text-lg md:text-xl'>User Management</h1>
      </div>

      <div className='flex flex-col md:flex-row justify-around items-center my-4'>
        <div className='flex items-center'>
          <input
            type='text'
            placeholder="Search by name, username, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='rounded shadow-gray-700 shadow-sm h-10 w-[250px] px-2 outline-emerald-500'
          />
          <button
            className='bg-emerald-400 text-white px-4 py-2 ml-2 rounded'
            onClick={() => setSearch("")}
          >
            Clear
          </button>
        </div>
        <Button variant="contained" color="success" onClick={handleOpenAdd}>
          + Add User
        </Button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="border-collapse border border-gray-300 w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">ID</th>
              <th className="border border-gray-400 px-4 py-2">USERNAME</th>
              <th className="border border-gray-400 px-4 py-2">NAME</th>
              <th className="border border-gray-400 px-4 py-2">EMAIL</th>
              <th className="border border-gray-400 px-4 py-2">EDIT</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((item) => (
                <tr 
                  key={item.id} 
                  className="group hover:bg-sky-700 hover:text-white transform transition-transform duration-[0.4s] ease-in-out hover:-translate-y-3 hover:shadow-md"
                >
                  <td className="border border-gray-400 px-4 py-2">{item.id}</td>
                  <td className="border border-gray-400 px-4 py-2 truncate">{item.name + item.id}</td>
                  <td className="border border-gray-400 px-4 py-2 truncate">{item.name}</td>
                  <td className="border border-gray-400 px-4 py-2 truncate">{item.email}</td>
                  <td className="border border-gray-400 px-4 py-2">
                    <button 
                      className="text-sky-600 group-hover:text-white transition-colors duration-300"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-2">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 mb-4">
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="secondary"
          />
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'white', boxShadow: 24, p: 4, borderRadius: 2
        }}>
          <Typography variant="h6" mb={2}>{editMode ? "Edit User" : "Add New User"}</Typography>
          <TextField fullWidth margin="normal" label="Name" name="name" value={formData.name} onChange={handleInputChange} />
          <TextField fullWidth margin="normal" label="Username" name="username" value={`${formData.name}${formData.id}`} InputProps={{ readOnly: true }} />
          <TextField fullWidth margin="normal" label="Email" name="email" value={formData.email} onChange={handleInputChange} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button variant="contained" color="error" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {editMode ? "Update" : "Submit"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Dashboard;