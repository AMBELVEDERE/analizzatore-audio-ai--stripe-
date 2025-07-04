
import React from 'react';
import { MindMapNode } from '../types';

interface MindMapNodeProps {
  node: MindMapNode;
  isRoot?: boolean;
  isLast?: boolean;
}

const MindMapBranch: React.FC<MindMapNodeProps> = ({ node, isRoot = false, isLast = false }) => {
  return (
    <li className="relative pl-10">
      {!isRoot && (
        <>
          <span className="absolute left-0 -top-4 w-px h-full bg-slate-600" aria-hidden="true"></span>
          <span className="absolute left-0 top-3 w-8 h-px bg-slate-600" aria-hidden="true"></span>
          {isLast && <span className="absolute left-0 top-3 w-px h-full bg-gray-800" aria-hidden="true"></span>}
        </>
      )}
      <div className="relative inline-block mb-4">
        <div className="bg-sky-800 text-white font-semibold px-4 py-2 rounded-lg shadow-lg border border-sky-600">
          {node.topic}
        </div>
      </div>

      {node.children && node.children.length > 0 && (
        <ul className="list-none pl-2">
          {node.children.map((child, index) => (
            <MindMapBranch
              key={index}
              node={child}
              isLast={index === (node.children?.length ?? 0) - 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

interface MindMapProps {
  data: MindMapNode;
}

const MindMap: React.FC<MindMapProps> = ({ data }) => {
  return (
    <div className="p-4 sm:p-6 bg-gray-800 rounded-lg">
      <ul className="list-none">
        <MindMapBranch node={data} isRoot={true} isLast={true} />
      </ul>
    </div>
  );
};

export default MindMap;
