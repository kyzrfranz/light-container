import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {FlattenedNodesObserver} from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';

/**
 * `light-container`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class LightContainer extends PolymerElement {

    static get template() {
        return html`<style>
    :host {
        display: inline-block;
        position: relative;
        width: 100%;
        height: 100%;
    }
    
    :host([development]){
        background-color: #AAA;
        border: 1px dotted #333;
    }
    
    :host([loading])::after{
        content: "loading...";
        position: absolute;
        width: 100%;
        height: 100%;
        top:0;
        left:0;
        background-image: linear-gradient(120deg, #FFF, #FFF);
        opacity: 1;
    }
          
</style>
<template is="dom-if" if="[[development]]">
    dev_modez
</template>
<template is="dom-if" if="[[!development]]">
    <slot id="mainSlot"></slot>
</template>
      
      
      
      
    `;
    }

    static get properties() {
        return {
            development: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },

            loading: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },

            lazyLoad: {
                type: Boolean,
                reflectToAttribute: true
            },
            _countdownLatch: {
                type: Number,
                value: 0,
                observer: '_onLatchChanged'
            },

            _nodes: {
                type: Array,
                value: []
            }
        };
    }


    connectedCallback() {
        super.connectedCallback()
        let startObserver = this._observeNodes.bind(this)
        setTimeout(startObserver, 0)

        if (this.lazyLoad) {
            this.loading = true
        }
    }

    disconnectedCallback() {
        this._observer.disconnect()
    }

    _observeNodes() {
        this._observer = new FlattenedNodesObserver(this.shadowRoot.querySelector('#mainSlot'), (info) => {
            this._processNewNodes(info.addedNodes);
            this._processRemovedNodes(info.removedNodes);
        });
    }

    _processNewNodes(addedNodes) {
        this._nodes = addedNodes

        for (let n of this._nodes) {
            if (n.nodeName != "#text") {

                if (this.lazyLoad && n.hasAttribute("lazy")) {
                    this._countdownLatch++
                    console.log("latch", this._countdownLatch)
                    let listenerHandle = this._signalListener.bind(this)
                    n.addEventListener("on-loaded", listenerHandle)
                }
            }
        }
    }

    _processRemovedNodes(removedNodes) {
        this._nodes.splice(removedNodes)
        console.log(this._nodes)
    }

    _signalListener(e) {
        console.log(e)
        if (this._countdownLatch > 0) {
            this._countdownLatch--
        }
    }

    _onLatchChanged(newValue, oldValue) {
        if (newValue == 0) {
            this.loading = false
        }
    }
}


window.customElements.define('light-container', LightContainer);
