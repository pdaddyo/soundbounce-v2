import React from 'react'
import TestUtils from 'react-addons-test-utils'
import {bindActionCreators} from 'redux'
import HomeView from 'views/HomeView/HomeView'
import {mount} from 'enzyme'

function shallowRender(component) {
	const renderer = TestUtils.createRenderer()

	renderer.render(component)
	return renderer.getRenderOutput()
}

function shallowRenderWithProps(props = {}) {
	return shallowRender(<HomeView {...props} />)
}

describe('(View) Home', function () {
	let _component, _rendered, _props, _spies

	beforeEach(function () {
		_component = shallowRenderWithProps(_props)
	})

	it('Should render as a <div>.', function () {
		expect(_component.type).to.equal('div')
	})

})
