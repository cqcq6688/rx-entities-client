import React, { useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { Cell, Node, Graph } from '@antv/x6';
import '@antv/x6-react-shape'
import { observer } from 'mobx-react';
import { getGraphConfig } from './get-grahp-config';
import { useModelsBoardStore } from '../store';
import { ClassView } from './class-view';
import { LinkAction } from '../store/link-action';
import $bus from '../model-event/bus';
import { EVENT_BEGIN_LNIK } from '../model-event/events';
import _ from "lodash";
import { CreateClassCommand } from '../command/create-class-command';
import { AddClassCommand } from '../command/add-class-command';
import { NodeChangeCommand } from '../command/node-change-command';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flex:1,
      display:'flex',
      flexFlow:'column',
      overflow:'auto',
    },
  }),
);

export const GraphCanvas = observer(()=>{
  const classes = useStyles();
  const modelStore = useModelsBoardStore();

  //禁止浏览器滚动，解决x6会增加浏览器滚动条的bug
  useEffect(()=>{
    const oldValue = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return ()=>{
      document.body.style.overflow = oldValue;
    }
  },[])

  useEffect(()=>{
    if(modelStore.selectedNode)
    {
      const selectionId = modelStore.selectedNode?.id;
      modelStore.graph?.cleanSelection();
      modelStore.graph?.select( modelStore.graph?.getCellById(selectionId));
    }

  },[ modelStore.graph, modelStore.selectedNode])

  const nodeSelectedClickHandle = (arg: { node: Cell<Cell.Properties>; })=>{
    modelStore.selectClass(arg.node.id);
  }

  const unselectedClickHandle = ()=>{
    if(modelStore.openedDiagram?.getNodeById(modelStore.selectedNode?.id||'')){
      modelStore.setSelectedNode(undefined);      
    }
  }

  const nodeAdded = (arg: { node: Node<Node.Properties>; })=>{
    const node = arg.node;
    const {isTempForNew, isTempForDrag, packageName, ...classMeta} = arg.node.data;
    if(!modelStore.openedDiagram){
      return;
    }

    if(isTempForNew){
      node.remove({disconnectEdges:true});
      const command = new CreateClassCommand(modelStore.openedDiagram, classMeta, 
        {
          //拖放时有Clone动作，ID被改变，所以取Data里面的ID使用
          id:classMeta.id||'', 
          x:node.getPosition().x, 
          y:node.getPosition().y, 
          width: node.getSize().width, 
          height: node.getSize().height,
        }
      )
      modelStore.excuteCommand(command);
    }
    if(isTempForDrag){
      node.remove({disconnectEdges:true});
      if(modelStore.graph?.getCellById(classMeta.id)){
        return;
      }
      const command = new AddClassCommand(modelStore.openedDiagram, modelStore?.rootStore.getClassById(classMeta.id),
      {
        //拖放时有Clone动作，ID被改变，所以取Data里面的ID使用
        id:classMeta.id||'', 
        x:node.getPosition().x, 
        y:node.getPosition().y, 
        width: node.getSize().width, 
        height: node.getSize().height,
      }
      )
      modelStore.excuteCommand(command);
    }
  }

  const nodeChangeHandle = (arg: { node: Node<Node.Properties>; })=>{
    const node = arg.node;
    if(!modelStore.openedDiagram){
      return;
    }
    const command = new NodeChangeCommand(modelStore.openedDiagram,
      {
        id:node.id,
        x:node.getPosition().x, 
        y:node.getPosition().y, 
        width: node.getSize().width, 
        height: node.getSize().height,
      },
      modelStore.rootStore.getClassById(node.id),
    )
    modelStore.setChangingCommand(command);
  }

  const nodeChangedHandle = (arg: { node: Node<Node.Properties>; })=>{
    const node = arg.node;
    if(!modelStore.openedDiagram || !modelStore.changingCommand){
      modelStore.setChangingCommand(undefined);
      return;
    }
    modelStore.changingCommand.setNewNodeMeta({
      id:node.id,
      x:node.getPosition().x, 
      y:node.getPosition().y, 
      width: node.getSize().width, 
      height: node.getSize().height,
    });
    modelStore.excuteCommand(modelStore.changingCommand);
    modelStore.setChangingCommand(undefined);
  }

  useEffect(()=>{
    const config = getGraphConfig();
    const graph =  new Graph(config as any);
    //graph?.enableSelection();
    modelStore.setGraph(graph);
    graph.on('node:selected', nodeSelectedClickHandle);
    graph.on('node:unselected', unselectedClickHandle);
    graph.on('node:added', nodeAdded);
    graph.on('node:move', nodeChangeHandle);
    graph.on('node:moved', nodeChangedHandle);
    graph.on('node:resize', nodeChangeHandle);
    graph.on('node:resized', nodeChangedHandle);
    return ()=>{
      graph.off('node:selected', nodeSelectedClickHandle);
      graph.off('node:unselected', unselectedClickHandle);
      graph.off('node:added', nodeAdded);
      graph.off('node:move', nodeChangeHandle);
      graph.off('node:moved', nodeChangedHandle);
      graph.off('node:resize', nodeChangeHandle);
      graph.off('node:resized', nodeChangedHandle);
      graph?.dispose();
      modelStore.setGraph(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[modelStore.openedDiagram])

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const p = modelStore.graph?.clientToLocal({x: clientX, y: clientY});
    if (modelStore.drawingLink?.tempEdge) {
      modelStore.drawingLink?.tempEdge.setTarget(p as any);
    }
  }

  const nodes = modelStore.openedDiagram?.getNodes();
  useEffect(()=>{
    nodes?.forEach(node=>{
      const grahpNode =  modelStore.graph?.getCellById(node.id) as Node<Node.Properties>;
      if(grahpNode) {
        //Update by diff
        if(!_.isEqual(node.data, grahpNode.data)){
          grahpNode.setData(node.data);
        }
        if(node.x !== grahpNode.getPosition().x 
          || node.y !== grahpNode.getPosition().y
          || node.width !== grahpNode.getSize().width
          || node.height !== grahpNode.getSize().height
        ){
          grahpNode.setSize(node as any);
          grahpNode.setPosition(node as any);
        }
      }
      else{
        modelStore.graph?.addNode({...node, shape: 'react-shape', component: <ClassView />});
      }
    })
    modelStore.graph?.getNodes().forEach(node=>{
      if(!modelStore.openedDiagram?.getNodeById(node.id)){
        modelStore.graph?.removeNode(node.id);
      }
    })
  })

  const handleStratLink = (linkAction:LinkAction)=>{
    const p = modelStore.graph?.clientToLocal(linkAction.initPoint);
    linkAction.tempEdge = modelStore.graph?.addEdge({
      source: linkAction.sourceNode,
      target: p,
      attrs: {
        line: {
          stroke: '#000',
          strokeWidth: 1,
        }
      }
    })
    linkAction.tempEdge?.attr({
      line: {
        targetMarker: {
          tagName: 'path',
          fill: '#FFF',  
          stroke: '#000', 
          strokeWidth: 1,
          d: 'M 18 -9 0 0 18 9 Z',
        },
      },
    })
    modelStore.setDrawingLink(linkAction);
  }

  const handleMouseUp = ()=>{
    modelStore.drawingLink?.tempEdge && modelStore.graph?.removeEdge(modelStore.drawingLink?.tempEdge);
    modelStore.setDrawingLink(undefined);
    //modelStore.setPressInherit(false);
  }

  useEffect(()=>{
    $bus.on(EVENT_BEGIN_LNIK, handleStratLink);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return ()=>{
      $bus.off(EVENT_BEGIN_LNIK, handleStratLink);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  
  return (
    <div className={classes.root} id="container">
    </div>
  )
})
