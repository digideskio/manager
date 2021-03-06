import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import SourceSelection from '../components/SourceSelection';
import ServiceSelection from '../components/ServiceSelection';
import DatacenterSelection from '../components/DatacenterSelection';
import Details from '../components/Details';
import { fetchDistros } from '~/actions/api/distros';
import { fetchDatacenters } from '~/actions/api/datacenters';
import { fetchServices } from '~/actions/api/services';
import { setError } from '~/actions/errors';
import { createLinode } from '~/actions/api/linodes';

export class IndexPage extends Component {
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      label: '',
      password: '',
      service: '',
      enableBackups: false,
      datacenter: '',
      source: '',
      sourceTab: 0,
      errors: {},
      loading: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    try {
      await Promise.all([
        dispatch(fetchDistros()),
        dispatch(fetchDatacenters()),
        dispatch(fetchServices()),
      ]);
    } catch (response) {
      dispatch(setError(response));
    }
  }

  async onSubmit({ label, password }) {
    const { dispatch } = this.props;
    const { service, source, datacenter } = this.state;
    try {
      this.setState({ loading: true });
      const linode = await dispatch(createLinode({
        root_pass: password, service, source, datacenter, label,
      }));
      this.setState({ loading: false });
      // TODO: show user introductory stuff
      // TODO: enable backups
      dispatch(push(`/linodes/${linode.id}`));
    } catch (response) {
      const { errors } = await response.json();
      const errorsByField = {};
      errors.forEach(({ field, reason }) => {
        if (!(field in errorsByField)) errorsByField[field] = [];
        errorsByField[field].push(reason);
      });
      this.setState({ loading: false, errors: errorsByField });
    }
  }

  render() {
    const {
      distros,
      datacenters,
      services,
    } = this.props;
    const {
      source,
      datacenter,
      service,
      sourceTab,
      loading,
    } = this.state;

    return (
      <div className="create-page">
        <h1>Add a Linode</h1>
        <div className="card page-card">
          <SourceSelection
            source={source}
            selectedTab={sourceTab}
            distros={distros.distributions}
            onTabChange={ix => this.setState({ sourceTab: ix })}
            onSourceSelected={id => this.setState({ source: id })}
          />
        </div>
        <div className="card page-card">
          <DatacenterSelection
            selected={datacenter}
            datacenters={datacenters.datacenters}
            onDatacenterSelected={id => this.setState({ datacenter: id })}
          />
        </div>
        <div className="card page-card">
          <ServiceSelection
            selected={service}
            services={services.services}
            onServiceSelected={id => this.setState({ service: id })}
          />
        </div>
        <div className="card page-card">
          <Details
            onSubmit={this.onSubmit}
            submitEnabled={!!source && !!datacenter && !!service && !loading}
            errors={this.state.errors}
          />
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  distros: PropTypes.object,
  services: PropTypes.object,
  datacenters: PropTypes.object,
};

function select(state) {
  return {
    distros: state.api.distros,
    datacenters: state.api.datacenters,
    services: state.api.services,
  };
}

export default connect(select)(IndexPage);
