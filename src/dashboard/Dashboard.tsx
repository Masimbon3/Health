import React, { useEffect } from 'react'
import { Alert, Card, Col, Container, Row, Spinner } from 'react-bootstrap'
import { useQuery } from 'react-query'

import { useUpdateTitle } from '../page-header/title/TitleContext'
import AppointmentRepository from '../shared/db/AppointmentRepository'
import ImagingRepository from '../shared/db/ImagingRepository'
import IncidentRepository from '../shared/db/IncidentRepository'
import LabRepository from '../shared/db/LabRepository'
import MedicationRepository from '../shared/db/MedicationRepository'
import PatientRepository from '../shared/db/PatientRepository'
import useTranslator from '../shared/hooks/useTranslator'

type DataDomain = 'patients' | 'appointments' | 'labs' | 'medications' | 'imagings' | 'incidents'

type DataMetric = {
  domain: DataDomain
  value: number
}

const fetchPlatformMetrics = async (): Promise<DataMetric[]> => {
  const [patients, appointments, labs, medications, imagings, incidents] = await Promise.all([
    PatientRepository.count(),
    AppointmentRepository.count(),
    LabRepository.count(),
    MedicationRepository.count(),
    ImagingRepository.count(),
    IncidentRepository.count(),
  ])

  return [
    { domain: 'patients', value: patients },
    { domain: 'appointments', value: appointments },
    { domain: 'labs', value: labs },
    { domain: 'medications', value: medications },
    { domain: 'imagings', value: imagings },
    { domain: 'incidents', value: incidents },
  ]
}

const Dashboard: React.FC = () => {
  const { t } = useTranslator()
  const updateTitle = useUpdateTitle()
  const { data: metrics = [], isLoading, isError } = useQuery('dashboard-metrics', fetchPlatformMetrics)

  useEffect(() => {
    updateTitle(t('dashboard.label'))
  }, [t, updateTitle])

  const totalRecords = metrics.reduce((runningTotal, metric) => runningTotal + metric.value, 0)

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h3>{t('dashboard.centralHubTitle')}</h3>
          <p className="text-muted mb-0">{t('dashboard.centralHubDescription')}</p>
        </Col>
      </Row>
      {isError && <Alert variant="danger">{t('dashboard.metricsLoadError')}</Alert>}
      {isLoading && <Spinner animation="border" role="status" />}
      {!isLoading && !isError && (
        <>
          <Row className="mb-4">
            <Col md={6} lg={4}>
              <Card>
                <Card.Body>
                  <Card.Title>{t('dashboard.totalRecordsLabel')}</Card.Title>
                  <h2 className="mb-0">{totalRecords}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            {metrics.map((metric) => (
              <Col key={metric.domain} sm={6} lg={4} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>{t(`dashboard.metrics.${metric.domain}`)}</Card.Title>
                    <h4 className="mb-0">{metric.value}</h4>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  )
}

export default Dashboard
