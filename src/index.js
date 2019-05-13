/**
 * Internal dependencies
 */
import TableOfContentsToolbar from './toc-toolbar';

const { flatMap, isEqual, kebabCase } = lodash;
const { compose } = wp.compose;
const { withSelect, withDispatch } = wp.data;
const { __, setLocaleData } = wp.i18n;
const { Component, Fragment } = wp.element;
const { registerBlockType } = wp.blocks;
const { BlockControls, RichText } = wp.blockEditor;

const withHeadings = compose(
	withSelect( ( select ) => {
		const { getBlocks } = select( 'core/block-editor' );

		return {
			blocks: getBlocks().filter( block => 'core/heading' === block.name && '' !== block.attributes.content ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { updateBlockAttributes } = dispatch( 'core/editor' );
		return { updateBlockAttributes };
	} )
);

const TableOfContents = ( props ) => {
	const { outline = [], bulletStyle = 'disc' } = props;
	const listStyle = {
		listStyleType: bulletStyle,
	};
	const className = 'decimal' === bulletStyle ? 'nested' : null;

	return (
		<ol style={ listStyle } className={ className }>
			{ outline.map( ( node ) => {
				const { anchor, content, children = [] } = node;
				return (
					<li key={ anchor }>
						<a href={ '#' + anchor }>{ content }</a>
						{ children.length > 0 && <TableOfContents outline={ children } bulletStyle={ bulletStyle } /> }
					</li>
				);
			} ) }
		</ol>
	);
};

const save = ( { className, attributes = {} } ) => {
	const { outline = [], bulletStyle, title } = attributes;
	return (
		<div className={ className } >
			{ ! RichText.isEmpty( title ) && <RichText.Content tagName="h5" value={ title } /> }
			<TableOfContents outline={ outline } bulletStyle={ bulletStyle } />
		</div>
	);
};

class editComponent extends Component {
	constructor() {
		super( ...arguments );
		this.computeOutline = this.computeOutline.bind( this );
		this.updateOutline = this.updateOutline.bind( this );
		this.onChangeBulletStyle = this.onChangeBulletStyle.bind( this );
		this.onChangeTitle = this.onChangeTitle.bind( this );
		this.updateOutline();
	}
	
	computeOutline( blocks = [], nodes = [], parentLevel ) {

		if ( 0 === blocks.length ) {
			return blocks;
		}

		let level = undefined === parentLevel ? blocks[0].attributes.level : parentLevel;
		let node;

		while (  blocks.length > 0 ) {
			if ( blocks[0].attributes.level > level ) {
				// The next to process is a child node.
				this.computeOutline( blocks, node.children, blocks[0].attributes.level );
				continue;
			}

			if ( undefined !== parentLevel && blocks[0].attributes.level < level ) {
				return;
			}

			const block = blocks.shift();

			node = {
				content: block.attributes.content,
				children: [],
				anchor: block.attributes.anchor,
			};

			// Does this block have an anchor? If not, set one so it can be linked to.
			if ( undefined === block.attributes.anchor ) {
				this.props.updateBlockAttributes( block.clientId, { anchor: kebabCase( block.attributes.content ) + '-' + block.clientId } );
			}

			nodes.push( node );

			if ( undefined === parentLevel && block.attributes.level < level ) {
				// If we don't have a parent level and we've found a block on a lower level,
				// set that level as the current level. This is so we can still generate a
				// usable outline if, for example, the user starts off with a H3 and then
				// goes back to a H2.
				level = block.attributes.level;
			}
		}

		return nodes;
	};

	updateOutline() {
		const outline = this.computeOutline( flatMap( this.props.blocks ) );
		if ( ! isEqual( outline, this.props.attributes.outline ) ) {
			this.props.setAttributes( { outline } );
		}
	}

	componentDidUpdate( prevProps ) {
		this.updateOutline();
	}

	onChangeBulletStyle( nextBulletStyle ) {
		const { bulletStyle } = this.props.attributes;
		if ( nextBulletStyle !== bulletStyle ) {
			this.props.setAttributes( { bulletStyle: nextBulletStyle } );
		} else {
			this.props.setAttributes( { bulletStyle: 'none' } );
		}
	}

	onChangeTitle( title ) {
		this.props.setAttributes( { title } );
	}

	render() {
		const { className } = this.props;
		const { outline = [], bulletStyle, title } = this.props.attributes;
		console.log( 'EDIT: ' + className );
		return (
			<div className={ className }>
				<BlockControls>
					<TableOfContentsToolbar selectedStyle={ bulletStyle } onChange={ this.onChangeBulletStyle } />
				</BlockControls>
				<RichText
					tagName="h5"
					value={ title }
					onChange={ this.onChangeTitle }
				/>
				<TableOfContents outline={ outline } bulletStyle={ bulletStyle } />
			</div>
		);
	}
}

const edit = withHeadings( editComponent );

registerBlockType( 'a8c/support-table-of-contents', {
	title: __( 'Table of contents', 'toc' ),
	icon: 'editor-ol',
	category: 'widgets',
	attributes: {
		outline: {
			type: 'array',
			default: [],
		},
		bulletStyle: {
			type: 'string',
			default: 'none',
		},
		title: {
			type: 'string',
			default: __( 'Table of contents' ),
		},
	},
	edit,
	save,
} );
