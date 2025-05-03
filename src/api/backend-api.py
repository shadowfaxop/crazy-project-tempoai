# This is a sample Flask API that would be used to generate Terraform code
# In a real implementation, this would be deployed as a separate service

from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/api/generate', methods=['POST'])
def generate_terraform():
    """Generate Terraform code from AWS infrastructure diagram"""
    try:
        data = request.json
        nodes = data.get('nodes', [])
        connections = data.get('connections', [])
        
        # Generate the Terraform code
        result = generate_terraform_code(nodes, connections)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_terraform_code(nodes, connections):
    """Generate Terraform code from nodes and connections"""
    # Provider block
    provider_block = 'provider "aws" {\n  region = var.aws_region\n}'
    
    # Generate resource blocks
    resource_blocks = []
    for node in nodes:
        node_type = node.get('type')
        node_id = node.get('id').replace('-', '_')
        config = node.get('config', {})
        
        if node_type == 'ec2':
            resource_blocks.append(generate_ec2_resource(node_id, config))
        elif node_type == 's3':
            resource_blocks.append(generate_s3_resource(node_id, config))
        elif node_type == 'rds':
            resource_blocks.append(generate_rds_resource(node_id, config))
        elif node_type == 'lambda':
            resource_blocks.append(generate_lambda_resource(node_id, config))
        elif node_type == 'dynamodb':
            resource_blocks.append(generate_dynamodb_resource(node_id, config))
        # Add more resource types as needed
    
    # Generate connection resources
    connection_resources = []
    for connection in connections:
        source_id = connection.get('sourceId').replace('-', '_')
        target_id = connection.get('targetId').replace('-', '_')
        connection_type = connection.get('type', 'default')
        
        # Find the source and target nodes
        source_node = next((n for n in nodes if n.get('id') == connection.get('sourceId')), None)
        target_node = next((n for n in nodes if n.get('id') == connection.get('targetId')), None)
        
        if source_node and target_node:
            source_type = source_node.get('type')
            target_type = target_node.get('type')
            
            # Generate appropriate connection resources based on the types
            if source_type == 'ec2' and target_type == 'ebs':
                connection_resources.append(generate_volume_attachment(source_id, target_id)