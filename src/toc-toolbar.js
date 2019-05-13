const { __, sprintf } = wp.i18n;
const { Component } = wp.element;
const { Toolbar } = wp.components;

const ICONS = {
	disc: 'editor-ul',
	decimal: 'editor-ol',
};

const DESCRIPTIONS = {
	disc: 'Bulleted list',
	decimal: 'Numbered list',
};

class TableOfContentsToolbar extends Component {
	createListTypeControl( targetStyle, selectedStyle, onChange ) {
		return {
			icon: ICONS[ targetStyle ],
			// translators: %s: heading level e.g: "1", "2", "3"
			title: __( DESCRIPTIONS[ targetStyle ] ),
			isActive: targetStyle === selectedStyle,
			onClick: () => onChange( targetStyle ),
		};
	}

	render() {
		const { selectedStyle, onChange } = this.props;
		return (
			<Toolbar controls={ [ 'disc', 'decimal' ].map( ( index ) => this.createListTypeControl( index, selectedStyle, onChange ) ) } />
		);
	}
}

export default TableOfContentsToolbar;
