import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { departmentAPI } from '../../services/api'
import Table from '../../components/UI/Table'
import Badge from '../../components/UI/Badge'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Modal from '../../components/UI/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const Departments = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const { data, isLoading } = useQuery(
    ['departments', page, search],
    () => departmentAPI.getAll({
      page,
      limit: 10,
      search,
    }),
    {
      keepPreviousData: true
    }
  )

  const createMutation = useMutation(
    (data) => departmentAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments')
        toast.success('Department created successfully!')
        setShowModal(false)
        reset()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create department')
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => departmentAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments')
        toast.success('Department updated successfully!')
        setShowModal(false)
        setEditingDepartment(null)
        reset()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update department')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => departmentAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments')
        toast.success('Department deleted successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete department')
      }
    }
  )

  const departments = data?.data?.departments || []
  const pagination = data?.data?.pagination

  const handleEdit = (department) => {
    setEditingDepartment(department)
    reset({
      name: department.name,
      description: department.description,
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteMutation.mutate(id)
    }
  }

  const onSubmit = (data) => {
    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDepartment(null)
    reset()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's departments
          </p>
        </div>
        {hasPermission(['ADMIN', 'HR']) && (
          <div className="mt-4 sm:mt-0">
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Department
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-content">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="card">
        <div className="card-content p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Description</Table.Head>
                <Table.Head>Manager</Table.Head>
                <Table.Head>Employees</Table.Head>
                <Table.Head>Status</Table.Head>
                {hasPermission(['ADMIN', 'HR']) && <Table.Head>Actions</Table.Head>}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {departments.map((department) => (
                <Table.Row key={department.id}>
                  <Table.Cell>
                    <div className="text-sm font-medium text-gray-900">
                      {department.name}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-500">
                      {department.description || 'N/A'}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900">
                      {department.manager ? 
                        `${department.manager.firstName} ${department.manager.lastName}` : 
                        'N/A'
                      }
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900">
                      {department._count?.employees || 0}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={department.isActive ? 'success' : 'error'}>
                      {department.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Cell>
                  {hasPermission(['ADMIN', 'HR']) && (
                    <Table.Cell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(department)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(department.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {departments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No departments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-outline disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className="btn-outline disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingDepartment ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department Name *
            </label>
            <input
              {...register('name', { required: 'Department name is required' })}
              type="text"
              className="input mt-1"
              placeholder="Enter department name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input mt-1"
              placeholder="Enter department description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-outline">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="btn-primary flex items-center"
            >
              {(createMutation.isLoading || updateMutation.isLoading) && (
                <LoadingSpinner size="sm" className="mr-2" />
              )}
              {editingDepartment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Departments