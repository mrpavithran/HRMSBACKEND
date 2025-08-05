import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  MagnifyingGlassIcon, 
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline'
import { payrollAPI } from '../../services/api'
import Table from '../../components/UI/Table'
import Badge from '../../components/UI/Badge'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'

const Payroll = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [page, setPage] = useState(1)
  const { user, hasPermission } = useAuth()

  const { data, isLoading } = useQuery(
    ['payroll', page, search, statusFilter, monthFilter],
    () => payrollAPI.getAll({
      page,
      limit: 10,
      search,
      status: statusFilter,
      startDate: monthFilter ? `${monthFilter}-01` : undefined,
      employeeId: user?.role === 'EMPLOYEE' ? user.employee?.id : undefined
    }),
    {
      keepPreviousData: true
    }
  )

  const records = data?.data?.records || []
  const pagination = data?.data?.pagination

  const getStatusBadge = (status) => {
    const variants = {
      DRAFT: 'default',
      PROCESSED: 'info',
      PAID: 'success',
      CANCELLED: 'error'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleDownloadPayslip = (recordId) => {
    // This would typically generate and download a PDF payslip
    console.log('Downloading payslip for record:', recordId)
    // Implementation would depend on backend API
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <p className="mt-1 text-sm text-gray-500">
          {hasPermission(['ADMIN', 'HR']) 
            ? 'Manage employee payroll and salary information'
            : 'View your salary information and payslips'
          }
        </p>
      </div>

      {/* Summary Cards for HR/Admin */}
      {hasPermission(['ADMIN', 'HR']) && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-500 p-3 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Payroll
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      $125,000
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      This Month
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      $45,000
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <DocumentArrowDownIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      12
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Salary
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      $5,200
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PROCESSED">Processed</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="month"
              className="input"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setMonthFilter('')
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="card">
        <div className="card-content p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                {hasPermission(['ADMIN', 'HR']) && <Table.Head>Employee</Table.Head>}
                <Table.Head>Pay Period</Table.Head>
                <Table.Head>Base Salary</Table.Head>
                <Table.Head>Overtime</Table.Head>
                <Table.Head>Bonuses</Table.Head>
                <Table.Head>Deductions</Table.Head>
                <Table.Head>Net Pay</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {records.map((record) => (
                <Table.Row key={record.id}>
                  {hasPermission(['ADMIN', 'HR']) && (
                    <Table.Cell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {record.employee?.firstName[0]}{record.employee?.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee?.firstName} {record.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{record.employee?.employeeId}</div>
                        </div>
                      </div>
                    </Table.Cell>
                  )}
                  <Table.Cell>
                    <div className="text-sm text-gray-900">
                      {format(new Date(record.payPeriodStart), 'MMM dd')} - {format(new Date(record.payPeriodEnd), 'MMM dd, yyyy')}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(record.baseSalary)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900">
                      {formatCurrency(record.overtime)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900">
                      {formatCurrency(record.bonuses)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-900">
                      {formatCurrency(record.deductions)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(record.netPay)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {getStatusBadge(record.status)}
                  </Table.Cell>
                  <Table.Cell>
                    <button
                      onClick={() => handleDownloadPayslip(record.id)}
                      className="text-primary-600 hover:text-primary-900 flex items-center"
                      title="Download Payslip"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {records.length === 0 && (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll records</h3>
              <p className="mt-1 text-sm text-gray-500">
                No payroll records found for the selected criteria.
              </p>
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
    </div>
  )
}

export default Payroll